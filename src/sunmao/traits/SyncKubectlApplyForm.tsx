import { Type } from "@sinclair/typebox";
import { implementRuntimeTrait } from "@sunmao-ui/runtime";
import get from "lodash/get";

const TransformerTraitPropertiesSpec = Type.Object({
  setValueMethod: Type.String({
    title: "Set Value Method",
  }),
  formValue: Type.String({
    title: "Form value",
  }),
});
const TransformerTraitStateSpec = Type.Object({});

export default implementRuntimeTrait({
  version: "kui/v1",
  metadata: {
    name: "sync_kubectl_apply_form",
    description: "sync the value to kubectl apply form fields",
  },
  spec: {
    properties: TransformerTraitPropertiesSpec,
    methods: [
      {
        name: "syncToComponent",
        parameters: Type.Object({
          value: Type.Any(),
        }),
      },
    ],
    state: TransformerTraitStateSpec,
  },
})(() => {
  const hasInitializedMap = new Map<string, boolean>();
  const formItemValueCache = new Map<string, any>();
  const updateMap = new Map<string, boolean>();

  return ({
    formValue,
    setValueMethod,
    services,
    componentId,
    subscribeMethods,
  }) => {
    function syncToComponent() {
      const cachedFormItemValue = formItemValueCache.get(componentId);

      if (formValue !== cachedFormItemValue) {
        services.apiService.send("uiMethod", {
          componentId,
          name: setValueMethod,
          parameters: formValue,
        });
      }

      formItemValueCache.set(componentId, formValue);
    }

    if (hasInitializedMap.has(componentId) === false) {
      services.apiService.on(
        "uiMethod",
        ({ componentId: target, name: event, parameters }) => {
          if (target === componentId && event === "onChange") {
            updateMap.set(componentId, true);
          }
        }
      );
    }

    return {
      props: {
        componentDidMount: [
          () => {
            syncToComponent();
          },
        ],
        componentDidUpdate: [
          () => {
            syncToComponent();
          },
        ],
        componentDidUnmount: [
          () => {
            formItemValueCache.delete(componentId);
          },
        ],
      },
    };
  };
});
