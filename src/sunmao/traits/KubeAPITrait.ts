import { Type } from "@sinclair/typebox";
import {
  implementRuntimeTrait,
  EventCallBackHandlerSpec,
  UIServices,
} from "@sunmao-ui/runtime";
import {
  KubeApi,
  UnstructuredList,
} from "../../_internal/k8s-api-client/kube-api";
import { compact, debounce, delay, throttle } from "lodash";
import { Static } from "@sinclair/typebox";

export const runEventHandler = (
  handler: Omit<Static<typeof EventCallBackHandlerSpec>, "type">,
  rawHandlers: any,
  index: number,
  services: UIServices,
  slotKey: string,
  evalListItem?: boolean
) => {
  const { stateManager } = services;
  const send = () => {
    // Eval before sending event to assure the handler object is evaled from the latest state.
    const evalOptions = {
      slotKey,
      evalListItem,
    };
    const evaledHandlers = stateManager.deepEval(
      rawHandlers,
      evalOptions
    ) as Static<typeof EventCallBackHandlerSpec>[];
    const evaledHandler = evaledHandlers[index];

    if (evaledHandler.disabled && typeof evaledHandler.disabled === "boolean") {
      return;
    }

    services.apiService.send("uiMethod", {
      componentId: evaledHandler.componentId,
      name: evaledHandler.method.name,
      parameters: evaledHandler.method.parameters,
    });
  };
  const { wait } = handler;

  if (!wait || !wait.time) {
    return send;
  }

  return wait.type === "debounce"
    ? debounce(send, wait.time)
    : wait.type === "throttle"
    ? throttle(send, wait.time)
    : wait.type === "delay"
    ? () => delay(send, wait.time)
    : send;
};

const emptyData = {
  apiVersion: "",
  kind: "",
  metadata: {},
  items: [],
};

export const KubeAPITraitPropertiesSpec = Type.Object({
  basePath: Type.String({ title: "Base path" }),
  watchWsBasePath: Type.String({
    title: "Watch websocket base path",
  }),
  apiBase: Type.String({
    title: "API base",
    widget: "kui/v1/ApiBaseWidget",
    description: "K8s resource api base, e.g, /apis/apps/v1",
  }),
  namespace: Type.String({
    title: "Namespace",
    description: "namespace filter",
  }),
  resource: Type.String({
    title: "Resource",
    widget: "kui/v1/ResourceWidget",
    conditions: [
      {
        key: "apiBase",
        not: "",
      },
      {
        key: "apiBase",
        not: undefined,
      },
    ],
  }),
  name: Type.String({
    title: "Name",
  }),
  query: Type.Record(Type.String(), Type.Any(), {
    title: "Query",
  }),
  isAutoWatch: Type.Boolean({
    title: "Is auto watch",
  }),
  onResponse: Type.Array(EventCallBackHandlerSpec),
  onError: Type.Array(EventCallBackHandlerSpec),
  onDataUpdate: Type.Array(EventCallBackHandlerSpec),
});
export const KubeAPITraitStateSpec = Type.Object({
  loading: Type.Boolean(),
  error: Type.Any(),
  response: Type.Any(),
});

export default implementRuntimeTrait({
  version: "kui/v1",
  metadata: {
    name: "kubeApi",
    description: "",
    isDataSource: true,
  },
  spec: {
    properties: KubeAPITraitPropertiesSpec,
    state: KubeAPITraitStateSpec,
    methods: [
      {
        name: "trigger",
        parameters: Type.Object({}),
      },
      {
        name: "watch",
        parameters: Type.Object({}),
      },
      {
        name: "stop",
        parameters: Type.Object({}),
      },
    ],
  },
})(() => {
  const stopMap = new Map();
  const timeMap = new Map();
  const countUpdateMap = new Map();

  return ({
    trait,
    componentId,
    basePath,
    watchWsBasePath,
    apiBase,
    resource,
    name,
    namespace,
    query,
    isAutoWatch,
    onDataUpdate,
    onResponse,
    onError,
    services,
    mergeState,
    subscribeMethods,
  }) => {
    const api = new KubeApi<UnstructuredList>({
      basePath,
      watchWsBasePath,
      objectConstructor: {
        resourceBasePath: apiBase,
        resource: resource,
        namespace,
      },
    });

    function stop() {
      const stopFn = stopMap.get(componentId);

      stopFn?.();
    }

    async function watch() {
      const currentTime = (timeMap.get(componentId) ?? 0) + 1;

      timeMap.set(componentId, currentTime);

      mergeState({
        loading: true,
      });

      stop();
      // reset last retry's times and timer
      api.resetRetryState();

      const onListResponse = (response: UnstructuredList) => {
        mergeState({ loading: false, error: null, response });
        
        onResponse?.forEach((handler, index) => {
          runEventHandler(
            handler,
            trait.properties.onResponse,
            index,
            services,
            ""
          )();
        });
      };
      const onListWatchUpdate = (response: UnstructuredList) => {
        mergeState({ loading: false, error: null, response });
        
        onDataUpdate?.forEach((handler, index) => {
          runEventHandler(
            handler,
            trait.properties.onDataUpdate,
            index,
            services,
            ""
          )();
        });
      };

      const stopFn = await api
        .listWatch({
          query: {
            ...(query || {}),
            fieldSelector: compact(
              (name ? [`metadata.name=${name}`] : []).concat(
                query?.fieldSelector || []
              )
            ),
          },
          onResponse: onListResponse,
          onWatchUpdate: onListWatchUpdate
        })
        .catch((err) => {
          mergeState({ loading: false, error: err, response: emptyData });
          onError?.forEach((handler, index) => {
            runEventHandler(
              handler,
              trait.properties.onError,
              index,
              services,
              ""
            )();
          });
        });

      // if the last one didn't return and do the next watch
      // then stop the previous watch
      if (timeMap.get(componentId) > currentTime) {
        stopFn?.();
      } else {
        stopMap.set(componentId, stopFn);
      }
    }

    async function trigger() {
      mergeState({
        loading: true,
      });

      try {
        const response = await api.list({
          query: {
            ...(query || {}),
            fieldSelector: compact(
              (name ? [`metadata.name=${name}`] : []).concat(
                query?.fieldSelector || []
              )
            ),
          },
        });

        mergeState({ loading: false, error: null, response });
        onResponse?.forEach((handler, index) => {
          runEventHandler(
            handler,
            trait.properties.onResponse,
            index,
            services,
            ""
          )();
        });
        onDataUpdate?.forEach((handler, index) => {
          runEventHandler(
            handler,
            trait.properties.onDataUpdate,
            index,
            services,
            ""
          )();
        });
      } catch (error) {
        onError?.forEach((handler, index) => {
          runEventHandler(
            handler,
            trait.properties.onError,
            index,
            services,
            ""
          )();
        });
        mergeState({ loading: false, error, response: emptyData });
      }
    }

    subscribeMethods({
      trigger,
      watch,
      stop,
    });

    return {
      props: {
        traitPropertiesDidUpdated: [
          () => {
            countUpdateMap.set(
              componentId,
              (countUpdateMap.get(componentId) || 0) + 1
            );

            if (isAutoWatch && countUpdateMap.get(componentId) > 1) {
              watch();
            }
          },
        ],
        componentDidUnmount: [
          () => {
            stop();
          },
        ],
      },
    };
  };
});
