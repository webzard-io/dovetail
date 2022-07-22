import { Type } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { useEffect, useState } from "react";
import { generateFromSchema } from "../../_internal/utils/generate-from-schema";
import merge from "lodash/merge";
import set from "lodash/set";
import _KubectlApplyForm from "../../_internal/organisms/KubectlApplyForm/KubectlApplyForm";

const UiConfigFieldSchema = Type.Object({
  path: Type.String({
    widget: "kui/v1/KubectlApplyFormPathWidget",
  }),
  label: Type.String(),
  helperText: Type.String(),
  sectionTitle: Type.String(),
  error: Type.String(),
  widget: Type.String(),
  componentId: Type.String({
    isComponentId: true,
    widget: 'kui/v1/FieldCustomComponentWidget',
    widgetOptions: {
      isDisplayLabel: false,
    },
    conditions: [{
      key: 'widget',
      value: 'component'
    }]
  }),
});

export const UiConfigSchema = Type.Object({
  allowTogggleYaml: Type.Boolean(),
  layout: Type.Object({
    type: Type.KeyOf(
      Type.Object({
        simple: Type.Boolean(),
        tabs: Type.Boolean(),
        wizard: Type.Boolean(),
      })
    ),
    fields: Type.Array(UiConfigFieldSchema, {
      widget: "core/v1/array",
      widgetOptions: { displayedKeys: ["path", "label"] },
      conditions: [
        {
          key: "type",
          value: "simple",
        },
      ],
    }),
    tabs: Type.Array(
      Type.Object({
        title: Type.String(),
        fields: Type.Array(UiConfigFieldSchema, {
          widget: "core/v1/array",
          widgetOptions: { displayedKeys: ["path", "label"] },
        }),
      }),
      {
        widget: "core/v1/array",
        widgetOptions: { displayedKeys: ["title"] },
        conditions: [
          {
            key: "type",
            value: "tabs",
          },
        ],
      }
    ),
    steps: Type.Array(
      Type.Object({
        title: Type.String(),
        fields: Type.Array(UiConfigFieldSchema, {
          widget: "core/v1/array",
          widgetOptions: { displayedKeys: ["path", "label"] },
        }),
        disabled: Type.Boolean(),
        prevText: Type.String(),
        nextText: Type.String(),
      }),
      {
        widget: "core/v1/array",
        widgetOptions: { displayedKeys: ["title"] },
        conditions: [
          {
            key: "type",
            value: "wizard",
          },
        ],
      }
    ),
  }),
  cancelText: Type.String({}),
});

const KubectlApplyFormProps = Type.Object({
  k8sConfig: Type.Object({
    basePath: Type.String(),
  }),
  applyConfig: Type.Object({
    create: Type.Boolean(),
    patch: Type.Boolean(),
  }),
  formConfig: Type.Object(
    {
      yaml: Type.String(),
      schemas: Type.Array(Type.Any()),
      defaultValues: Type.Array(Type.Any()),
      uiConfig: UiConfigSchema,
    },
    {
      widget: "kui/v1/KubectlApplyFormDesignWidget",
    }
  ),
});

const KubectlApplyFormState = Type.Object({
  value: Type.Any(),
});

const exampleProperties = {
  applyConfig: {
    create: true,
    patch: true,
  },
  formConfig: {
    yaml: "",
    schemas: [],
    defaultValues: [],
    uiConfig: {
      allowTogggleYaml: false,
      layout: {
        type: "simple",
        fields: [],
      },
    },
  },
};

export const KubectlApplyForm = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_apply_form",
    displayName: "Kubectl Apply Form",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 4],
    exampleProperties,
    annotations: {
      category: "Input",
    },
  },
  spec: {
    properties: KubectlApplyFormProps,
    state: KubectlApplyFormState,
    methods: {
      setField: Type.Object({
        fieldPath: Type.String(),
        value: Type.Any(),
      }),
    },
    slots: {
      field: {
        slotProps: UiConfigFieldSchema,
      },
    },
    styleSlots: [],
    events: ["onChange", "onSubmit", "onCancel"],
  },
})(
  ({
    k8sConfig,
    applyConfig,
    formConfig,
    mergeState,
    slotsElements,
    subscribeMethods,
    callbackMap,
  }) => {
    const [values, setValues] = useState<any[]>(() => {
      const initValues = (formConfig.schemas || []).map((s, idx) => {
        return merge(generateFromSchema(s), formConfig.defaultValues?.[idx]);
      });

      mergeState({ value: initValues });
      return initValues;
    });
    useEffect(() => {
      subscribeMethods({
        setField({ fieldPath, value }) {
          setValues((prevValues) => {
            set(prevValues, fieldPath, value);
            const newValues = [...prevValues];
            mergeState({
              value: newValues,
            });
            return newValues;
          });
        },
      });
    }, []);

    return (
      <_KubectlApplyForm
        k8sConfig={k8sConfig}
        applyConfig={applyConfig}
        schemas={formConfig.schemas}
        uiConfig={formConfig.uiConfig}
        values={values}
        onChange={(newValues) => {
          setValues(newValues);
          mergeState({
            value: newValues,
          });
          callbackMap?.onChange();
        }}
        onSubmit={callbackMap?.onSubmit}
        onCancel={callbackMap?.onCancel}
        getSlot={(f, fallback) => {
          return slotsElements.field
            ? slotsElements.field(f, fallback)
            : fallback;
        }}
      />
    );
  }
);
