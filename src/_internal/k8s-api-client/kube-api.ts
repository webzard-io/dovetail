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
import mitt from "mitt";
import { get, toPath } from "lodash";

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
  onResponse?: (response: T) => void;
  onWatchUpdate?: (response: T) => void;
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

export type K8sObject = {
  apiVersion?: string;
  kind?: string;
  metadata?: ObjectMeta;
};

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

type KubeAPIEvent = {
  change: {
    type: WatchEvent["type"];
    basePath: string;
    items: Unstructured[];
  };
};

const event = mitt<KubeAPIEvent>();

export class KubeApi<T extends UnstructuredList> {
  private watchWsBasePath?: string;
  private basePath: string;
  private resourceBasePath: string;
  private namespace?: string;
  private resource: string;
  private maxTimeout = Math.pow(2, 10) * 1000;
  private retryTimes = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(protected options: KubeApiOptions) {
    const { objectConstructor, basePath, watchWsBasePath } = options;

    this.options = options;
    this.watchWsBasePath = watchWsBasePath;
    this.basePath = basePath;
    this.resourceBasePath = objectConstructor.resourceBasePath;
    this.namespace = objectConstructor.namespace;
    this.resource = objectConstructor.resource;
  }

  public resetRetryState() {
    this.retryTimes = 0;
    clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
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
    onWatchUpdate,
  }: KubeApiListWatchOptions<T> = {}): Promise<StopWatchHandler> {
    const url = this.getUrl({ namespace });
    const watchUrl = this.watchWsBasePath
      ? this.getUrl({ namespace }, undefined, true)
      : url;
    const response = await this.list({
      namespace,
      query,
      fetchOptions: { timeout: false },
    });
    const stop = this.watch(
      watchUrl,
      response,
      onWatchUpdate,
      this.listWatch.bind(this, {
        namespace,
        query,
        onResponse,
        onWatchUpdate,
      })
    );

    onResponse?.(response);

    return stop;
  }

  private async watch(
    url: string,
    response: T,
    onWatchUpdate: KubeApiListWatchOptions<T>["onResponse"],
    // let listwatch know it needs retry
    retry: () => Promise<StopWatchHandler>
  ): Promise<StopWatchHandler> {
    let { items } = response as unknown as UnstructuredList;
    const stops: Function[] = [];

    const handleEvent = (event: WatchEvent) => {
      if (event.type === "PING") {
        return;
      }

      informerLog("INFORMER", event);

      const name = event.object.metadata.name;
      const namespace = event.object.metadata.namespace;

      switch (event.type) {
        case "ADDED":
          // maybe already added by sdk event
          let exist = false;

          items = items
            .map((item) => {
              if (
                item.metadata.name === name &&
                item.metadata.namespace === namespace
              ) {
                exist = true;
                return event.object;
              }

              return item;
            })
            .concat(exist ? [] : [event.object]);

          break;
        case "MODIFIED":
          items = items.map((item) => {
            if (
              item.metadata.name === name &&
              item.metadata.namespace === namespace
            ) {
              return event.object;
            }
            return item;
          });
          break;
        case "DELETED":
          items = items.filter(
            (item) =>
              item.metadata.name !== name ||
              item.metadata.namespace !== namespace
          );
          break;
        default:
      }
      onWatchUpdate?.({
        ...response,
        items,
      });
    };

    stops.push(this.watchBySdk(response, handleEvent));

    if (this.watchWsBasePath) {
      stops.push(this.watchByWebsocket(url, response, handleEvent, retry));
    } else {
      stops.push(this.watchByHttp(url, response, handleEvent, retry));
    }

    return () => {
      stops.forEach((stop) => stop());
    };
  }

  private watchBySdk(response: T, handleEvent: (event: WatchEvent) => void) {
    const onChange = (params: KubeAPIEvent["change"]) => {
      const { type, basePath, items } = params;

      if (basePath !== this.basePath) return;

      items.forEach((object) => {
        if (
          object.apiVersion === response.apiVersion &&
          object.kind === response.kind.replace(/List$/g, "")
        ) {
          handleEvent({ type, object });
        }
      });
    };

    event.on("change", onChange);

    return () => {
      event.off("change", onChange);
    };
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
      url.includes("://")
        ? `${url}?resourceVersion=${resourceVersion}&watch=1`
        : `${protocol}://${location.host}/${url}?resourceVersion=${resourceVersion}&watch=1`
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

      this.retryFunc(async () => {
        stopWatch = await retry();
      });

      stopWatch = () => {
        clearTimeout(this.retryTimer);
      };
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

  private retryFunc(fn: () => void) {
    // Exponential backoff retry
    const timeout = Math.min(
      Math.pow(2, this.retryTimes) * 1000,
      this.maxTimeout
    );
    this.retryTimer = setTimeout(fn, timeout);
    this.retryTimes++;
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

export type KubernetesApplyAction = "create" | "patch";

/**
 * `application/json-patch+json` 策略下的一个 JSON Patch 操作。
 *
 * 字符串是「对该路径执行 replace」的简写，与 `replacePaths` 一直以来的含义保持一致。
 * 对象形式额外支持 `add` 和 `remove`，这是 `replace` 无法表达的。
 *
 * `path` 支持两种写法：
 * - 点分字符串，如 `spec.replicas`、`spec.containers[0].image`；
 * - 分段数组，如 `["metadata", "annotations", "app.kubernetes.io/name"]`。
 *
 * key 本身含有 `.` 或 `/` 时（annotation、label 这类场景很常见）**必须**用数组形式，
 * 否则点分字符串会被拆错，既定位不到值也生成不出正确的 JSON Pointer。
 *
 * `add` / `replace` 的 value 默认取自本次提交的资源（即表单内容），因此路径可以在
 * 服务端对象上不存在（这正是 `add` 的用途），但必须能在提交的资源中取到值。
 * 需要写入字面量、或往数组末尾追加（path 以 `-` 结尾）时，用 `value` 显式指定。
 *
 * `remove` 不携带 value，显式传入也会被忽略。
 */
export type JsonPatchOperation =
  | string
  | {
    op: "add" | "replace" | "remove";
    path: string | string[];
    value?: unknown;
  };

/**
 * 按 RFC 6901 转义 JSON Pointer 的单个 segment。
 *
 * JSON Pointer 用 `/` 分隔层级，所以 key 里真正含有的 `/` 必须转义成 `~1`；
 * 而 `~` 是转义符本身，必须先转成 `~0`。例如 key `app.kubernetes.io/name`
 * 要写成 `app.kubernetes.io~1name`，否则会被当成 `app.kubernetes.io` 和
 * `name` 两层。
 *
 * 两次 replace 的顺序不能颠倒：若先转 `/` → `~1`，新产生的 `~` 会被后一步
 * 再转成 `~0`，得到错误的 `~01`。
 */
function escapeJsonPointerSegment(segment: string) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * 把 `JsonPatchOperation` 的 path 转成 JSON Pointer。
 *
 * 用 lodash `toPath` 统一解析：字符串按点分和数组下标语法拆段，数组则原样保留
 * 每一段，因此含 `.` / `/` 的 key（K8s 的 annotation、label 基本都是这种）
 * 只能用数组形式表达。几个例子：
 *
 * ```
 * "spec.replicas"                                     → "/spec/replicas"
 * "spec.containers[0].image"                          → "/spec/containers/0/image"
 * "spec.containers.-"                                 → "/spec/containers/-"    // `-` 表示数组末尾
 * ["metadata", "annotations", "app.kubernetes.io/name"] → "/metadata/annotations/app.kubernetes.io~1name"
 * "metadata.annotations.app.kubernetes.io/name"       → "/metadata/annotations/app/kubernetes/io~1name"  // ✗ 点被当成层级分隔
 * ```
 *
 * path 为空时 `toPath` 得到 `[]`，结果是 `"/"`。注意 `"/"` 在 RFC 6901 中指的是
 * 「key 为空字符串的成员」而非文档根（文档根是空字符串 `""`），而这里恒定拼了
 * `"/"` 前缀，所以不可能生成出替换整个资源的指针。这里不额外校验，让 API Server
 * 返回错误。
 */
function toJsonPointer(path: string | string[]) {
  return "/" + toPath(path).map(escapeJsonPointerSegment).join("/");
}

/**
 * 把 `JsonPatchOperation[]` 编译成 RFC 6902 的 JSON Patch 文档。
 *
 * 抽成模块级纯函数而非 `patch()` 里的内联逻辑，是为了能脱离 HTTP 单独验证；
 * `spec` 只用于给未显式指定 `value` 的操作取值。
 */
export function buildJsonPatch(spec: K8sObject, operations: JsonPatchOperation[]) {
  return operations.map((operation) => {
    const { op, path } = typeof operation === "string"
      ? { op: "replace" as const, path: operation }
      : operation;
    const pointer = toJsonPointer(path);

    // remove 是唯一不携带 value 的操作
    if (op === "remove") {
      return { op, path: pointer };
    }

    // 显式传入的 value 优先（用于写字面量或往数组末尾追加），
    // 未传时回落到本次提交的资源上该路径的值
    const value = typeof operation !== "string" && "value" in operation
      ? operation.value
      : get(spec, path);

    return { op, path: pointer, value };
  });
}

const apiVersionResourceCache: Record<string, APIResourceList> = {};

type OperationOptions = {
  sync?: boolean;
};

export class KubeSdk {
  private basePath: string;
  private defaultNamespace = "default";

  constructor(protected options: KubeSdkOptions) {
    const { basePath } = options;

    this.options = options;
    this.basePath = basePath;
  }

  public async applyYaml(specs: Unstructured[], strategy?: string, replacePaths?: JsonPatchOperation[][], actions: KubernetesApplyAction[] = []) {
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    const changed: Unstructured[] = [];

    for (const index in validSpecs) {
      const spec = validSpecs[index];

      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};

      if (strategy === "application/apply-patch+yaml") {
        delete spec.metadata.managedFields;
        delete (spec as any).metadata.resourceVersion;
      }

      let action: KubernetesApplyAction = actions[index];

      if (!action) {
        action = "patch";
        
        try {
          await this.read(spec);
        } catch (e: any) {
          if (e.response?.status === 404) {
            action = "create";
          } else {
            throw e;
          }
        }
      }


      try {
        const isPatch = action === "patch";

        const response = isPatch
          ? await this.patch(
            spec,
            strategy || "application/merge-patch+json",
            replacePaths?.[index]
          )
          : await this.create(spec);

        if (isPatch) {
          event.emit("change", {
            type: "MODIFIED",
            basePath: this.basePath,
            items: [response as Unstructured],
          });
        } else {
          event.emit("change", {
            type: "ADDED",
            basePath: this.basePath,
            items: [response as Unstructured],
          });
        }
        changed.push(response as Unstructured);
      } catch (error) {

        throw error;
      }
    }

    return changed;
  }

  public async deleteYaml(specs: Unstructured[], options?: OperationOptions) {
    const { sync } = options || {};
    const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
    const deleted: Status[] = [];
    const deletedItems: Unstructured[] = [];

    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      const response = await this.delete(spec);
      deleted.push(response as Status);
      deletedItems.push(spec);
    }

    if (sync) {
      event.emit("change", {
        type: "DELETED",
        basePath: this.basePath,
        items: deletedItems,
      });
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

  private async patch(spec: K8sObject, strategy: string, replacePaths?: JsonPatchOperation[]) {
    const url = await this.specUriPath(spec, "patch");
    const json = strategy === "application/json-patch+json"
      ? buildJsonPatch(spec, replacePaths || [])
      : spec;
    const res = await ky
      .patch(url, {
        headers: {
          "Content-Type": strategy,
        },
        retry: 0,
        json,
        searchParams:
          strategy === "application/apply-patch+yaml"
            ? {
              fieldManager: "sks",
              force: true,
            }
            : undefined,
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
