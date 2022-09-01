import { Type } from "@sinclair/typebox";
import { implementRuntimeTrait } from "@sunmao-ui/runtime";
import {
  KubeApi,
  UnstructuredList,
} from "../../_internal/k8s-api-client/kube-api";
import { compact } from "lodash";

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
  fieldSelector: Type.String({
    title: "Field selector",
  }),
  isAutoWatch: Type.Boolean({
    title: "Is auto watch",
  }),
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
  const responseMap = new Map();
  const stopMap = new Map();
  const timeMap = new Map();

  return ({
    componentId,
    basePath,
    watchWsBasePath,
    apiBase,
    resource,
    name,
    namespace,
    fieldSelector,
    isAutoWatch,
    mergeState,
    subscribeMethods,
  }) => {
    const api = new KubeApi<UnstructuredList>({
      basePath,
      watchWsBasePath,
      objectConstructor: {
        kind: "",
        apiBase: `${apiBase}/${resource}`,
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

      const stopFn = await api
        .listWatch({
          query: {
            namespace,
            fieldSelector: compact([
              name && `metadata.name=${name}`,
              fieldSelector,
            ]).join(","),
          },
          cb: (response) => {
            responseMap.set(componentId, response);
            mergeState({ loading: false, error: null, response });
          },
        })
        .catch((err) => {
          mergeState({ loading: false, error: err, response: emptyData });
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
            namespace,
            fieldSelector: compact([
              name && `metadata.name=${name}`,
              fieldSelector,
            ]).join(","),
          },
        });

        mergeState({ loading: false, error: null, response });
      } catch (error) {
        mergeState({ loading: false, error, response: emptyData });
      }
    }

    subscribeMethods({
      trigger,
      watch,
      stop,
    });

    if (isAutoWatch) {
      watch();
    }

    return {
      props: {
        componentDidUnmount: [
          () => {
            stop();
          },
        ],
      },
    };
  };
});
