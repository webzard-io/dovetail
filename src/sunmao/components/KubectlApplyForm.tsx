import { Type, Static } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { PRESET_PROPERTY_CATEGORY, StringUnion } from "@sunmao-ui/shared";
import { useEffect, useState } from "react";
import { generateFromSchema } from "../../_internal/utils/schema";
import merge from "lodash/merge";
import set from "lodash/set";
import _KubectlApplyForm from "../../_internal/organisms/KubectlApplyForm/KubectlApplyForm";
import { css } from "@emotion/css";
import {
  FORM_WIDGETS_MAP,
  FORM_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/form";

const UiConfigFieldSpecProperties = {
  path: Type.String({
    title: "Path",
    widget: "kui/v1/PathWidget",
  }),
  key: Type.String({
    title: "Key",
    description: "Use for the `latestChangedKey` state",
  }),
  label: Type.String({ title: "Label" }),
  isDisplayLabel: Type.Boolean({
    title: "Is display label",
  }),
  layout: StringUnion(["horizontal", "vertical"], { title: "Layout" }),
  helperText: Type.String({ title: "Helper text" }),
  sectionTitle: Type.String({ title: "Section title" }),
  error: Type.String({ title: "Error" }),
  condition: Type.Boolean({ title: "Condition" }),
  widget: StringUnion(
    ["default", "component"].concat(Object.keys(FORM_WIDGETS_MAP)),
    {
      title: "Widget",
    }
  ),
  widgetOptions: Type.Record(Type.String(), Type.Any(), {
    title: "Widget options",
    widget: "kui/v1/OptionsWidget",
    widgetOptions: {
      optionsMap: FORM_WIDGET_OPTIONS_MAP,
    },
  }),
  componentId: Type.String({
    title: "ComponentId",
    isComponentId: true,
    widget: "kui/v1/FieldCustomComponentWidget" as any,
    widgetOptions: {
      isDisplayLabel: false,
    },
    conditions: [
      {
        key: "widget",
        value: "component",
      },
    ],
  }),
};
const UiConfigFieldSpec = Type.Object(
  {
    ...UiConfigFieldSpecProperties,
    fields: Type.Array(Type.Object(UiConfigFieldSpecProperties), {
      title: "Fields",
      widget: "core/v1/array",
      widgetOptions: { displayedKeys: ["path", "label"] },
    }),
  },
  {
    widget: "kui/v1/KubectlApplyFormFieldWidget",
  }
);

export const UiConfigSpec = Type.Object({
  allowToggleYaml: Type.Boolean({ title: "Allow toggle YAML" }),
  title: Type.String({
    title: "Title",
  }),
  layout: Type.Object(
    {
      type: Type.KeyOf(
        Type.Object({
          simple: Type.Boolean(),
          tabs: Type.Boolean(),
          wizard: Type.Boolean(),
        }),
        {
          title: "Type",
        }
      ),
      fields: Type.Array(UiConfigFieldSpec, {
        title: "Fields",
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
          title: Type.String({ title: "Title" }),
          fields: Type.Array(UiConfigFieldSpec, {
            title: "Fields",
            widget: "core/v1/array",
            widgetOptions: { displayedKeys: ["path", "label"] },
          }),
        }),
        {
          title: "Tabs",
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
          title: Type.String({ title: "Title" }),
          fields: Type.Array(UiConfigFieldSpec, {
            title: "Fields",
            widget: "core/v1/array",
            widgetOptions: { displayedKeys: ["path", "label"] },
          }),
          disabled: Type.Boolean({ title: "Disabled" }),
          prevText: Type.String({ title: "Previous text" }),
          nextText: Type.String({ title: "Next text" }),
        }),
        {
          title: "Steps",
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
    },
    {
      title: "Layout",
    }
  ),
  confirmText: Type.String({ title: "Confirm text" }),
  cancelText: Type.String({ title: "Cancel text" }),
});

const KubectlApplyFormProps = Type.Object({
  basePath: Type.String({
    title: "Base path",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  applyConfig: Type.Object(
    {
      create: Type.Boolean({ title: "Create" }),
      patch: Type.Boolean({ title: "Patch" }),
    },
    {
      title: "Apply config",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }
  ),
  formConfig: Type.Object(
    {
      yaml: Type.String({
        title: "YAML",
      }),
      schemas: Type.Array(Type.Any(), { title: "Schemas" }),
      defaultValues: Type.Array(Type.Any(), { title: "Default values" }),
      uiConfig: UiConfigSpec,
    },
    {
      title: "Form config",
      category: PRESET_PROPERTY_CATEGORY.Basic,
      widget: "kui/v1/KubectlApplyFormDesignWidget",
    }
  ),
  error: Type.String({
    title: "Error",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  errorDetail: Type.String({
    title: "Error detail",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
});

const KubectlApplyFormState = Type.Object({
  value: Type.Any(),
  latestChangedKey: Type.String(),
});

export const KubectlApplyForm = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_apply_form",
    displayName: "Kubectl Apply Form",
    exampleProperties: {
      applyConfig: {
        create: true,
        patch: true,
      },
      formConfig: {
        yaml: "",
        schemas: [],
        defaultValues: [],
        uiConfig: {
          layout: {
            type: "simple",
            fields: [],
          },
        },
      },
    },
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
        slotProps: UiConfigFieldSpec,
      },
    },
    styleSlots: ["content"],
    events: ["onChange", "onSubmit", "onCancel"],
  },
})(
  ({
    basePath,
    applyConfig,
    formConfig,
    error,
    errorDetail,
    mergeState,
    slotsElements,
    subscribeMethods,
    customStyle,
    callbackMap,
    elementRef,
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
        ref={elementRef}
        className={css(customStyle?.content)}
        basePath={basePath}
        applyConfig={applyConfig}
        schemas={formConfig.schemas}
        uiConfig={formConfig.uiConfig}
        values={values}
        error={error}
        errorDetail={errorDetail}
        onChange={(newValues: any, key?: string) => {
          setValues(newValues);
          mergeState({
            value: newValues,
            latestChangedKey: key,
          });
          callbackMap?.onChange?.();
        }}
        onSubmit={callbackMap?.onSubmit}
        onCancel={callbackMap?.onCancel}
        getSlot={(f, fallback) => {
          return (
            slotsElements.field?.(
              f as Static<typeof UiConfigFieldSpec>,
              fallback,
              `filed_${f?.path}_${f?.key}`
            ) || fallback
          );
        }}
      />
    );
  }
);
