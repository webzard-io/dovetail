// highly inspired by https://github.com/lensapp/lens/blob/1a29759bff/src/common/k8s-api/kube-api.ts
import ky, { SearchParamsOption } from "ky";
import type {
  APIResource,
  APIResourceList,
  ListMeta,
  ObjectMeta,
  Status,
} from "kubernetes-types/meta/v1";

type KubeApiQueryParams = {
  watch?: boolean | number;
  resourceVersion?: string;
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
  labelSelector?: string | string[]; // restrict list of objects by their labels, e.g. labelSelector: ["label=value"]
  fieldSelector?: string | string[]; // restrict list of objects by their fields, e.g. fieldSelector: "field=name"
  namespace?: string;
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
  basePath: string;
  watchWsBasePath?: string;
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

export function parseKubeApi(path: string): KubeApiParsed {
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

type StopWatchHandler = () => void;

type K8sObject = { apiVersion?: string; kind?: string; metadata?: ObjectMeta };

export class KubeApi<T> {
  private basePath: string;
  private apiVersion: string;
  private apiPrefix: string;
  private apiGroup: string;
  private apiResource: string;
  private watchWsBasePath?: string;
  public objectConstructor: KubeObjectConstructor;

  constructor(protected options: KubeApiOptions) {
    const { objectConstructor, basePath, watchWsBasePath } = options;
    const { apiPrefix, apiGroup, apiVersion, resource } = parseKubeApi(
      objectConstructor.apiBase
    );

    this.options = options;
    this.basePath = basePath;
    this.apiPrefix = apiPrefix ?? "";
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiResource = resource;
    this.watchWsBasePath = watchWsBasePath;
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
  }: KubeApiListWatchOptions<T> = {}): Promise<StopWatchHandler> {
    const controller: {
      stopHandler: Promise<StopWatchHandler> | null;
    } = {
      stopHandler: null,
    };

    const self = this;

    function startInformer() {
      controller.stopHandler = self.createInformer(
        { namespace, query, cb },
        startInformer
      );
    }

    startInformer();

    return async () => {
      if (controller.stopHandler) {
        const h = await controller.stopHandler;
        h();
      }
    };
  }

  private async createInformer(
    { namespace, query, cb }: KubeApiListWatchOptions<T> = {},
    retryCb: () => void
  ) {
    const url = this.getUrl({ namespace });
    const res = await ky
      .get(url, {
        searchParams: query as URLSearchParams,
        retry: 0,
        timeout: false,
      })
      .json<T>();

    cb?.(res);

    const watchUrl = this.watchWsBasePath
      ? this.getUrl({ namespace }, undefined, true)
      : url;

    return this.watch(watchUrl, res, cb, retryCb);
  }

  private async watch(
    url: string,
    res: T,
    cb: KubeApiListWatchOptions<T>["cb"],
    // let listwatch know it needs retry
    retryCb: () => void
  ): Promise<StopWatchHandler> {
    const { resourceVersion } = (res as unknown as UnstructuredList).metadata;
    let { items } = res as unknown as UnstructuredList;

    const self = this;

    const handleEvent = (event: any) => {
      if (event.type === "PING") {
        return;
      }
      self.informerLog(event);
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
    };

    if (this.watchWsBasePath) {
      const protocol = location.protocol.includes("https") ? "wss" : "ws";
      const socket = new WebSocket(
        `${protocol}://${location.host}/${url}?resourceVersion=${resourceVersion}&watch=1`
      );
      socket.addEventListener("open", () => {});
      socket.addEventListener("message", function (msg) {
        const event = JSON.parse(msg.data);
        handleEvent(event);
      });
      socket.addEventListener("close", (evt) => {
        if (evt.reason === "DOVETAIL_MANUAL_CLOSE") {
          return;
        }
        retryCb();
      });

      return () => {
        socket.close(3001, "DOVETAIL_MANUAL_CLOSE");
      };
    }

    const controller = new AbortController();
    const { signal } = controller;
    ky.get(url, {
      searchParams: {
        watch: 1,
        resourceVersion,
      } as SearchParamsOption,
      timeout: false,
      signal,
    })
      .then((streamRes) => {
        const stream = streamRes.body?.getReader();
        const utf8Decoder = new TextDecoder("utf-8");
        let buffer = "";

        // wait for an update and prepare to read it
        stream
          ?.read()
          .then(function onIncomingStream({
            done,
            value,
          }): Promise<ReadableStreamDefaultReadResult<Uint8Array> | void> {
            if (done) {
              return Promise.resolve();
            }
            buffer += utf8Decoder.decode(value);
            const remainingBuffer = findLine(buffer, (line) => {
              try {
                const event = JSON.parse(line);
                handleEvent(event);
              } catch (error) {
                self.informerLog("Error while parsing", line, "\n", error);
              }
            });

            buffer = remainingBuffer;

            // continue waiting & reading the stream of updates from the server
            return stream.read().then(onIncomingStream);
          });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return; // ignore
        }
        this.informerLog("watch API error:", err);
        retryCb();
      });

    return () => {
      controller.abort();
    };
  }

  private informerLog(...args: Parameters<typeof console.log>) {
    return console.log("[DOVETAIL INFORMER]", ...args);
  }

  private get apiVersionWithGroup() {
    return [this.apiGroup, this.apiVersion].filter(Boolean).join("/");
  }

  private getUrl(
    { name, namespace }: Partial<ResourceDescriptor> = {},
    query?: Partial<KubeApiQueryParams>,
    watch?: boolean
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

    const basePath = watch ? this.watchWsBasePath : this.basePath;

    return (
      basePath + resourcePath + (query ? `?${searchParams.toString()}` : "")
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

type KubeSdkOptions = {
  basePath: string;
};

type KubernetesApiAction =
  | "create"
  | "delete"
  | "patch"
  | "read"
  | "list"
  | "replace";

const apiVersionResourceCache: Record<string, APIResourceList> = {};

export class KubeSdk {
  private basePath: string;
  private defaultNamespace = "default";

  constructor(protected options: KubeSdkOptions) {
    const { basePath } = options;

    this.options = options;
    this.basePath = basePath;
  }

  public async applyYaml(specs: K8sObject[]) {
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    const created: K8sObject[] = [];

    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      delete spec.metadata.annotations[
        "kubectl.kubernetes.io/last-applied-configuration"
      ];
      spec.metadata.annotations[
        "kubectl.kubernetes.io/last-applied-configuration"
      ] = JSON.stringify(spec);
      try {
        await this.read(spec);
        const response = await this.patch(spec, "application/merge-patch+json");
        created.push(response as K8sObject);
      } catch (e) {
        const response = await this.create(spec);
        created.push(response as K8sObject);
      }
    }

    return created;
  }

  public async deleteYaml(specs: K8sObject[]) {
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    const deleted: Status[] = [];

    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      const response = await this.delete(spec);
      deleted.push(response as Status);
    }

    return deleted;
  }

  private async read(spec: K8sObject) {
    const url = await this.specUriPath(spec, "read");
    const res = await ky
      .get(url, {
        retry: 0,
      })
      .json();

    return res;
  }

  private async create(spec: K8sObject) {
    const url = await this.specUriPath(spec, "create");
    const res = await ky
      .post(url, {
        retry: 0,
        json: spec,
      })
      .json();

    return res;
  }

  private async patch(spec: K8sObject, strategy: string) {
    const url = await this.specUriPath(spec, "patch");
    const res = await ky
      .patch(url, {
        headers: {
          "Content-Type": strategy,
        },
        retry: 0,
        json: spec,
      })
      .json();

    return res;
  }

  private async delete(spec: K8sObject) {
    const url = await this.specUriPath(spec, "delete");
    const res = await ky
      .delete(url, {
        retry: 0,
      })
      .json();

    return res;
  }

  private apiVersionPath(apiVersion: string): string {
    const api = apiVersion.includes("/") ? "apis" : "api";
    return [this.basePath, api, apiVersion].join("/");
  }

  private async specUriPath(
    spec: K8sObject,
    action: KubernetesApiAction
  ): Promise<string> {
    if (!spec.kind) {
      throw new Error("Required spec property kind is not set");
    }
    if (!spec.apiVersion) {
      spec.apiVersion = "v1";
    }
    if (!spec.metadata) {
      spec.metadata = {};
    }
    const resource = await this.resource(spec.apiVersion, spec.kind);
    if (!resource) {
      throw new Error(
        `Unrecognized API version and kind: ${spec.apiVersion} ${spec.kind}`
      );
    }
    if (resource.namespaced && !spec.metadata.namespace && action !== "list") {
      spec.metadata.namespace = this.defaultNamespace;
    }
    const parts = [this.apiVersionPath(spec.apiVersion)];
    if (resource.namespaced && spec.metadata.namespace) {
      parts.push(
        "namespaces",
        encodeURIComponent(String(spec.metadata.namespace))
      );
    }
    parts.push(resource.name);
    if (action !== "create" && action !== "list") {
      if (!spec.metadata.name) {
        throw new Error("Required spec property name is not set");
      }
      parts.push(encodeURIComponent(String(spec.metadata.name)));
    }
    return parts.join("/").toLowerCase();
  }

  private async resource(
    apiVersion: string,
    kind: string
  ): Promise<APIResource> {
    const cacheKey = this.getApiVersionCacheKey(apiVersion);

    if (apiVersionResourceCache[cacheKey]) {
      const resource = apiVersionResourceCache[cacheKey].resources.find(
        (r) => r.kind === kind
      );
      if (resource) {
        return resource;
      }
    }

    const localVarPath = this.apiVersionPath(apiVersion);

    const resources = await ky.get(localVarPath).json<APIResourceList>();
    apiVersionResourceCache[cacheKey] = resources;

    return apiVersionResourceCache[cacheKey].resources.find(
      (r) => r.kind === kind
    )!;
  }

  private getApiVersionCacheKey(apiVersion: string) {
    return `${apiVersion}@${this.basePath}`;
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
