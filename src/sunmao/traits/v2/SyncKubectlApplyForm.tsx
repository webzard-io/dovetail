import { Type } from "@sinclair/typebox";
import { implementRuntimeTrait } from "@sunmao-ui/runtime";

export const SyncSpec = Type.Object({
  setValueMethod: Type.String({
    title: "Set Value Method",
  }),
  formValue: Type.String({
    title: "Form value",
  }),
});
const TransformerTraitPropertiesSpec = Type.Object({
  syncs: Type.Array(SyncSpec),
});
const TransformerTraitStateSpec = Type.Object({});

export default implementRuntimeTrait({
  version: "kui/v2",
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
  const formItemValueCache = new Map<string, Map<string, any>>();

  return ({ syncs, services, componentId }) => {
    function syncToComponents() {
      let cachedValueMap = formItemValueCache.get(componentId);

      if (cachedValueMap === undefined) {
        cachedValueMap = new Map();

        formItemValueCache.set(componentId, cachedValueMap);
      }

      syncs.map(({ formValue, setValueMethod }) => {
        const cachedFormItemValue = cachedValueMap?.get(setValueMethod);

        if (formValue !== cachedFormItemValue) {
          services.apiService.send("uiMethod", {
            componentId,
            name: setValueMethod,
            parameters: formValue,
            eventType: '',
            triggerId: '',
          });
        }

        cachedValueMap?.set(setValueMethod, formValue);
      });
    }

    return {
      props: {
        componentDidMount: [
          () => {
            syncToComponents();
          },
        ],
        componentDidUpdate: [
          () => {
            syncToComponents();
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
