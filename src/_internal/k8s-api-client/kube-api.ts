// highly inspired by https://github.com/lensapp/lens/blob/1a29759bff/src/common/k8s-api/kube-api.ts
import ky, { SearchParamsOption } from "ky";
import type { ListMeta, ObjectMeta } from "kubernetes-types/meta/v1";

type KubeApiQueryParams = {
  watch?: boolean | number;
  resourceVersion?: string;
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
  labelSelector?: string | string[]; // restrict list of objects by their labels, e.g. labelSelector: ["label=value"]
  fieldSelector?: string | string[]; // restrict list of objects by their fields, e.g. fieldSelector: "field=name"
};

type ResourceDescriptor = {
  /**
   * The name of the kubernetes resource
   */
  name: string;

  /**
   * The namespace that the resource lives in (if the resource is namespaced)
   *
   * Note: if not provided and the resource kind is namespaced, then this defaults to `"default"`
   */
  namespace?: string;
};

type KubeApiListOptions = {
  namespace?: string;
  query?: KubeApiQueryParams;
};

type KubeApiListWatchOptions<T> = KubeApiListOptions & {
  cb?: (value: T) => void;
};

type KubeApiLinkRef = {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name?: string;
  namespace?: string;
};

type KubeObjectConstructor = {
  kind: string;
  namespace?: string;
  apiBase: string;
};

type KubeApiOptions = {
  /**
   * The constructor for the kube objects returned from the API
   */
  objectConstructor: KubeObjectConstructor;
};

type KubeApiParsed = KubeApiLinkRef & {
  apiBase: string;
  apiGroup: string;
  apiVersionWithGroup: string;
};

function createKubeApiURL({
  apiPrefix = "/apis",
  resource,
  apiVersion,
  name,
  namespace,
}: KubeApiLinkRef): string {
  const parts = [apiPrefix, apiVersion];

  if (namespace) {
    parts.push("namespaces", namespace);
  }

  parts.push(resource);

  if (name) {
    parts.push(name);
  }

  return parts.join("/");
}

function splitArray<T>(array: T[], element: T): [T[], T[], boolean] {
  const index = array.indexOf(element);

  if (index < 0) {
    return [array, [], false];
  }

  return [array.slice(0, index), array.slice(index + 1, array.length), true];
}

function parseKubeApi(path: string): KubeApiParsed {
  const apiPath = new URL(path, "http://localhost").pathname;
  const [, prefix, ...parts] = apiPath.split("/");
  const apiPrefix = `/${prefix}`;
  const [left, right, namespaced] = splitArray(parts, "namespaces");
  let apiGroup, apiVersion, namespace, resource, name;

  if (namespaced) {
    switch (right.length) {
      case 1:
        name = right[0];
      // fallthrough
      case 0:
        resource = "namespaces"; // special case this due to `split` removing namespaces
        break;
      default:
        [namespace, resource, name] = right;
        break;
    }

    apiVersion = left.pop();
    apiGroup = left.join("/");
  } else {
    switch (left.length) {
      case 0:
        throw new Error(`invalid apiPath: ${apiPath}`);
      case 4:
        [apiGroup, apiVersion, resource, name] = left;
        break;
      case 2:
        resource = left.pop();
      // fallthrough
      case 1:
        apiVersion = left.pop();
        apiGroup = "";
        break;
      default:
        /**
         * Given that
         *  - `apiVersion` is `GROUP/VERSION` and
         *  - `VERSION` is `DNS_LABEL` which is /^[a-z0-9]((-[a-z0-9])|[a-z0-9])*$/i
         *     where length <= 63
         *  - `GROUP` is /^D(\.D)*$/ where D is `DNS_LABEL` and length <= 253
         *
         * There is no well defined selection from an array of items that were
         * separated by '/'
         *
         * Solution is to create a heuristic. Namely:
         * 1. if '.' in left[0] then apiGroup <- left[0]
         * 2. if left[1] matches /^v[0-9]/ then apiGroup, apiVersion <- left[0], left[1]
         * 3. otherwise assume apiVersion <- left[0]
         * 4. always resource, name <- left[(0 or 1)+1..]
         */
        if (left[0].includes(".") || left[1].match(/^v[0-9]/)) {
          [apiGroup, apiVersion] = left;
          resource = left.slice(2).join("/");
        } else {
          apiGroup = "";
          apiVersion = left[0];
          [resource, name] = left.slice(1);
        }
        break;
    }
  }

  const apiVersionWithGroup = [apiGroup, apiVersion].filter((v) => v).join("/");
  const apiBase = [apiPrefix, apiGroup, apiVersion, resource]
    .filter((v) => v)
    .join("/");

  if (!apiBase) {
    throw new Error(`invalid apiPath: ${apiPath}`);
  }

  return {
    apiBase,
    apiPrefix,
    apiGroup,
    apiVersion: apiVersion ?? "",
    apiVersionWithGroup,
    namespace,
    resource: resource ?? "",
    name,
  };
}

function findLine(buffer: string, fn: (line: string) => void): string {
  const newLineIndex = buffer.indexOf("\n");
  // if the buffer doesn't contain a new line, do nothing
  if (newLineIndex === -1) {
    return buffer;
  }
  const chunk = buffer.slice(0, buffer.indexOf("\n"));
  const newBuffer = buffer.slice(buffer.indexOf("\n") + 1);

  // found a new line! execute the callback
  fn(chunk);

  // there could be more lines, checking again
  return findLine(newBuffer, fn);
}

export class KubeApi<T> {
  private apiVersion: string;
  private apiPrefix: string;
  private apiGroup: string;
  private apiResource: string;
  public objectConstructor: KubeObjectConstructor;

  constructor(protected options: KubeApiOptions) {
    const { objectConstructor } = options;
    const { apiPrefix, apiGroup, apiVersion, resource } = parseKubeApi(
      objectConstructor.apiBase
    );

    this.options = options;
    this.apiPrefix = apiPrefix ?? "";
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiResource = resource;
    this.objectConstructor = objectConstructor;
  }

  public async list({ namespace, query }: KubeApiListOptions = {}): Promise<T> {
    const url = this.getUrl({ namespace });
    const res = await ky
      .get(url, {
        searchParams: query as URLSearchParams,
        retry: 0,
      })
      .json<T>();

    return res;
  }

  public async listWatch({
    namespace,
    query,
    cb,
  }: KubeApiListWatchOptions<T> = {}) {
    const url = this.getUrl({ namespace });
    const res = await ky
      .get(url, {
        searchParams: query as URLSearchParams,
        retry: 0,
      })
      .json<T>();

    cb?.(res);
    const streamRes = await ky.get(url, {
      searchParams: {
        watch: 1,
        resourceVersion: ((res as unknown) as UnstructuredList).metadata
          .resourceVersion,
      } as SearchParamsOption,
      timeout: false,
    });
    const stream = streamRes.body?.getReader();
    const utf8Decoder = new TextDecoder("utf-8");
    let buffer = "";
    let items = ((res as unknown) as UnstructuredList).items;

    // wait for an update and prepare to read it
    return stream
      ?.read()
      .then(function onIncomingStream({
        done,
        value,
      }): Promise<ReadableStreamReadResult<Uint8Array> | void> {
        if (done) {
          return Promise.resolve();
        }
        buffer += utf8Decoder.decode(value);
        const remainingBuffer = findLine(buffer, (line) => {
          try {
            const event = JSON.parse(line);
            console.log(event);
            const name = event.object.metadata.name;
            switch (event.type) {
              case "ADDED":
                items = items.concat(event.object);
                break;
              case "MODIFIED":
                items = items.map((item) => {
                  if (item.metadata.name === name) {
                    return event.object;
                  }
                  return item;
                });
                break;
              case "DELETED":
                items = items.filter((item) => item.metadata.name !== name);
                break;
              default:
            }
            cb?.({
              ...res,
              items,
            });
          } catch (error) {
            console.log("Error while parsing", line, "\n", error);
          }
        });

        buffer = remainingBuffer;

        // continue waiting & reading the stream of updates from the server
        return stream.read().then(onIncomingStream);
      });
  }

  private get apiVersionWithGroup() {
    return [this.apiGroup, this.apiVersion].filter(Boolean).join("/");
  }

  private getUrl(
    { name, namespace }: Partial<ResourceDescriptor> = {},
    query?: Partial<KubeApiQueryParams>
  ) {
    const resourcePath = createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
      namespace: this.objectConstructor.namespace,
      name,
    });

    const searchParams = new URLSearchParams(
      this.normalizeQuery(query) as URLSearchParams
    );

    return (
      "/proxy-k8s" + resourcePath + (query ? `?${searchParams.toString()}` : "")
    );
  }

  private normalizeQuery(query: Partial<KubeApiQueryParams> = {}) {
    if (query.labelSelector) {
      query.labelSelector = [query.labelSelector].flat().join(",");
    }

    if (query.fieldSelector) {
      query.fieldSelector = [query.fieldSelector].flat().join(",");
    }

    return query;
  }
}

export type UnstructuredList = {
  apiVersion: string;
  kind: string;
  metadata: ListMeta;
  items: Unstructured[];
};

export type Unstructured = {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
};
