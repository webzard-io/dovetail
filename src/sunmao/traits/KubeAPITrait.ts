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
    apiBase,
    resource,
    name,
    namespace,
    fieldSelector,
    mergeState,
    subscribeMethods,
  }) => {
    const api = new KubeApi<UnstructuredList>({
      basePath,
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
            fieldSelector: compact([
              name && `metadata.name=${name}`,
              namespace && `metadata.namespace=${namespace}`,
              fieldSelector,
            ]).join(","),
          },
          cb: (response) => {
            responseMap.set(componentId, response);
            mergeState({});
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

    subscribeMethods({
      watch,
      stop,
    });

    watch();

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
