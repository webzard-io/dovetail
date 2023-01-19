// highly inspired by https://github.com/lensapp/lens/blob/1a29759bff/src/common/k8s-api/kube-api.ts
import ky, { SearchParamsOption, Options } from "ky";
import type {
  APIResource,
  APIResourceList,
  ListMeta,
  ObjectMeta,
  Status,
} from "kubernetes-types/meta/v1";
import { informerLog } from "../utils/log";

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
  fetchOptions?: Options;
};

type KubeApiListWatchOptions<T> = KubeApiListOptions & {
  onResponse?: (value: T) => void;
};

type KubeApiLinkRef = {
  resourceBasePath: string;
  resource: string;
  name?: string;
  namespace?: string;
};

type KubeObjectConstructor = {
  resourceBasePath: string;
  namespace?: string;
  resource: string;
};

type KubeApiOptions = {
  basePath: string;
  watchWsBasePath?: string;
  /**
   * The constructor for the kube objects returned from the API
   */
  objectConstructor: KubeObjectConstructor;
};

type StopWatchHandler = () => void;

type K8sObject = { apiVersion?: string; kind?: string; metadata?: ObjectMeta };

type ExtendedWebsocketClient = WebSocket & {
  pingTimeout?: ReturnType<typeof setTimeout>;
};

type WatchEvent = {
  type: "ADDED" | "MODIFIED" | "DELETED" | "PING";
  object: Unstructured;
};

function createKubeApiURL({
  resourceBasePath,
  namespace,
  resource,
  name,
}: KubeApiLinkRef): string {
  const parts = [resourceBasePath];

  if (namespace) {
    parts.push(`/namespaces/${namespace}`);
  }

  parts.push(resource);

  if (name) {
    parts.push(name);
  }

  return parts.join("/");
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

function heartbeat(ws: ExtendedWebsocketClient) {
  clearTimeout(ws.pingTimeout);

  /**
   * Currently SKS will send PING message every 30 seconds,
   * and we add 50% buffer(15 seconds) to it.
   * If the client does not receive message for 45 seconds,
   * it will close the connection and retry.
   *
   * TODO: make the timeout value configurable
   */
  ws.pingTimeout = setTimeout(() => {
    ws.close();
  }, 30_000 * 1.5);
}

export class KubeApi<T> {
  private watchWsBasePath?: string;
  private basePath: string;
  private resourceBasePath: string;
  private namespace?: string;
  private resource: string;

  constructor(protected options: KubeApiOptions) {
    const { objectConstructor, basePath, watchWsBasePath } = options;

    this.options = options;
    this.watchWsBasePath = watchWsBasePath;
    this.basePath = basePath;
    this.resourceBasePath = objectConstructor.resourceBasePath;
    this.namespace = objectConstructor.namespace;
    this.resource = objectConstructor.resource;
  }

  public async list({
    namespace,
    query,
    fetchOptions,
  }: KubeApiListOptions = {}): Promise<T> {
    const url = this.getUrl({ namespace });
    const res = await ky
      .get(url, {
        searchParams: query as URLSearchParams,
        retry: 0,
        ...(fetchOptions || {}),
      })
      .json<T>();

    return res;
  }

  public async listWatch({
    namespace,
    query,
    onResponse,
  }: KubeApiListWatchOptions<T> = {}): Promise<StopWatchHandler> {
    const url = this.getUrl({ namespace });
    const watchUrl = this.watchWsBasePath
      ? this.getUrl({ namespace }, undefined, true)
      : url;
    const response = await this.list({
      namespace,
      query,
      fetchOptions: { timeout: 0 },
    });
    const stop = this.watch(
      watchUrl,
      response,
      onResponse,
      this.listWatch.bind(this, {
        namespace,
        query,
        onResponse: onResponse,
      })
    );

    onResponse?.(response);

    return stop;
  }

  private async watch(
    url: string,
    response: T,
    onResponse: KubeApiListWatchOptions<T>["onResponse"],
    // let listwatch know it needs retry
    retry: () => Promise<StopWatchHandler>
  ): Promise<StopWatchHandler> {
    let { items } = response as unknown as UnstructuredList;

    const handleEvent = (event: WatchEvent) => {
      if (event.type === "PING") {
        return;
      }

      informerLog("INFORMER", event);

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
      onResponse?.({
        ...response,
        items,
      });
    };

    if (this.watchWsBasePath) {
      return this.watchByWebsocket(url, response, handleEvent, retry);
    }

    return this.watchByHttp(url, response, handleEvent, retry);
  }

  private watchByWebsocket(
    url: string,
    res: T,
    handleEvent: (event: WatchEvent) => void,
    // let listwatch know it needs retry
    retry: () => Promise<StopWatchHandler>
  ) {
    const { resourceVersion = "" } = (res as unknown as UnstructuredList)
      .metadata;
    const protocol = location.protocol.includes("https") ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${location.host}/${url}?resourceVersion=${resourceVersion}&watch=1`
    );
    let shouldCloseAfterConnected = false;
    let stopWatch: () => void = () => {
      if (socket.readyState === socket.OPEN) {
        socket.close(3001, "DOVETAIL_MANUAL_CLOSE");
      } else {
        shouldCloseAfterConnected = true;
      }
    };

    function stop() {
      stopWatch();
    }

    socket.addEventListener("open", () => {
      if (shouldCloseAfterConnected) {
        socket.close(3001, "DOVETAIL_MANUAL_CLOSE");
        return;
      }
      heartbeat(socket);
    });
    socket.addEventListener("message", function (msg) {
      const event = JSON.parse(msg.data) as WatchEvent;

      heartbeat(socket);
      handleEvent(event);
    });
    socket.addEventListener("close", (evt) => {
      clearTimeout((socket as ExtendedWebsocketClient).pingTimeout);

      if (evt.reason === "DOVETAIL_MANUAL_CLOSE") {
        return;
      }

      (async () => {
        stopWatch = await retry();
      })();
    });

    return stop;
  }

  private watchByHttp(
    url: string,
    res: T,
    handleEvent: (event: WatchEvent) => void,
    // let listwatch know it needs retry
    retry: () => Promise<StopWatchHandler>
  ) {
    const { resourceVersion = "" } = (res as unknown as UnstructuredList)
      .metadata;
    const controller = new AbortController();
    const { signal } = controller;
    let stopWatch = () => controller.abort();

    function stop() {
      stopWatch();
    }

    (async () => {
      try {
        const streamResponse = await ky.get(url, {
          searchParams: {
            watch: 1,
            resourceVersion,
          } as SearchParamsOption,
          timeout: false,
          signal,
        });
        const stream = streamResponse.body?.getReader();
        const utf8Decoder = new TextDecoder("utf-8");
        let buffer = "";

        // wait for an update and prepare to read it
        (async function readStream(): Promise<ReadableStreamDefaultReadResult<Uint8Array> | void> {
          if (!stream) return Promise.reject();

          const { done, value } = await stream.read();

          if (done) {
            return Promise.resolve();
          }

          buffer += utf8Decoder.decode(value);
          const remainingBuffer = findLine(buffer, (line) => {
            try {
              const event = JSON.parse(line) as WatchEvent;

              handleEvent(event);
            } catch (error) {
              informerLog("INFORMER", "Error while parsing", line, "\n", error);
            }
          });

          buffer = remainingBuffer;

          // continue waiting & reading the stream of updates from the server
          return readStream();
        })();
      } catch (err: any) {
        if (err.name === "AbortError") {
          return; // ignore
        }

        informerLog("INFORMER", "watch API error:", err);
        stopWatch = await retry();
      }
    })();

    return stop;
  }

  private getUrl(
    { name, namespace }: Partial<ResourceDescriptor> = {},
    query?: Partial<KubeApiQueryParams>,
    watch?: boolean
  ) {
    const resourcePath = createKubeApiURL({
      resourceBasePath: this.resourceBasePath,
      resource: this.resource,
      namespace: namespace || this.namespace,
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

      let exist = true;
      try {
        await this.read(spec);
      } catch (e) {
        exist = false;
      }

      const response = exist
        ? await this.patch(spec, "application/merge-patch+json")
        : await this.create(spec);
      created.push(response as K8sObject);
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

    spec.apiVersion = spec.apiVersion || "v1";
    spec.metadata = spec.metadata || {};

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
