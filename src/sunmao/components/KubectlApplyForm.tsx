import { Type, Static } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { PRESET_PROPERTY_CATEGORY, StringUnion } from "@sunmao-ui/shared";
import React, { useEffect, useState, useRef } from "react";
import { generateFromSchema } from "../../_internal/utils/schema";
import merge from "lodash/merge";
import set from "lodash/set";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import _KubectlApplyForm from "../../_internal/organisms/KubectlApplyForm/KubectlApplyForm";
import { css } from "@emotion/css";
import {
  FORM_WIDGETS_MAP,
  FORM_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/form";
import { KubeApi, KubeSdk } from "../../_internal/k8s-api-client/kube-api";
import { generateSlotChildren } from "../utils/slot";

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
  labelWidth: Type.Number({
    title: "Label Width",
  }),
  isDisplayLabel: Type.Boolean({
    title: "Is display label",
  }),
  layout: StringUnion(["horizontal", "vertical"], { title: "Layout" }),
  helperText: Type.String({ title: "Helper text" }),
  sectionTitle: Type.String({ title: "Section title" }),
  error: Type.String({ title: "Error" }),
  condition: Type.Boolean({ title: "Condition" }),
  col: Type.Number({
    title: "Col",
  }),
  splitLine: Type.Boolean({
    title: "Split line",
  }),
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
  summaryConfig: Type.Object({
    type: StringUnion(["auto", "item"]),
    label: Type.String(),
    value: Type.String(),
    icon: Type.String(),
    hidden: Type.Boolean(),
  }),
};
const UiConfigFieldSpec = Type.Object(
  {
    ...UiConfigFieldSpecProperties,
    fields: Type.Array(Type.Object(UiConfigFieldSpecProperties), {
      title: "Fields",
      widget: "core/v1/array",
      widgetOptions: { displayedKeys: ["path", "label"], appendToBody: true },
    }),
  },
  {
    widget: "kui/v1/KubectlApplyFormFieldWidget",
  }
);

export const UiConfigSpec = Type.Object({
  allowToggleYaml: Type.Boolean({ title: "Allow toggle YAML" }),
  isDisplaySummary: Type.Boolean({ title: "Is display summary" }),
  isDisplayFooter: Type.Boolean({
    title: "Is display footer",
  }),
  title: Type.String({
    title: "Title",
  }),
  layout: Type.Object(
    {
      type: StringUnion(["simple", "tabs", "wizard"], {
        title: "Type",
      }),
      fields: Type.Array(UiConfigFieldSpec, {
        title: "Fields",
        widget: "core/v1/array",
        widgetOptions: { displayedKeys: ["path", "label"], appendToBody: true },
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
            widgetOptions: {
              displayedKeys: ["path", "label"],
              appendToBody: true,
            },
          }),
        }),
        {
          title: "Tabs",
          widget: "core/v1/array",
          widgetOptions: { displayedKeys: ["title"], appendToBody: true },
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
            widgetOptions: {
              displayedKeys: ["path", "label"],
              appendToBody: true,
            },
          }),
          disabled: Type.Boolean({ title: "Disabled" }),
          prevText: Type.String({ title: "Previous text" }),
          nextText: Type.String({ title: "Next text" }),
        }),
        {
          title: "Steps",
          widget: "core/v1/array",
          widgetOptions: { displayedKeys: ["title"], appendToBody: true },
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
    category: PRESET_PROPERTY_CATEGORY.Behavior,
  }),
  errorDetail: Type.Object(
    {
      title: Type.String({ title: "Title" }),
      errors: Type.Array(Type.String(), { title: "Errors" }),
    },
    {
      title: "Error detail",
      category: PRESET_PROPERTY_CATEGORY.Behavior,
    }
  ),
  submitting: Type.Boolean({
    title: "Submitting",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
  }),
});

const KubectlApplyFormState = Type.Object({
  value: Type.Any(),
  displayValue: Type.Any(),
  latestChangedKey: Type.String(),
  latestChangedPath: Type.String(),
  step: Type.Number(),
  loading: Type.Boolean(),
  error: Type.Any(),
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
        displayValue: Type.Any(),
      }),
      setDisplayValue: Type.Object({
        fieldPath: Type.String(),
        displayValue: Type.Any(),
      }),
      nextStep: Type.Object({}),
      apply: Type.Object({}),
      clearError: Type.Object({}),
    },
    slots: {
      field: {
        slotProps: UiConfigFieldSpec,
      },
      helper: {
        slotProps: UiConfigFieldSpec,
      },
    },
    styleSlots: ["content"],
    events: [
      "onChange",
      "onNextStep",
      "onSubmit",
      "onCancel",
      "onApplySuccess",
      "onApplyFail",
    ],
  },
})(
  ({
    basePath,
    applyConfig,
    formConfig,
    error,
    errorDetail,
    submitting,
    app,
    component,
    services,
    mergeState,
    slotsElements,
    subscribeMethods,
    customStyle,
    callbackMap,
    elementRef,
  }) => {
    const [step, setStep] = useState(0);
    const [values, setValues] = useState<any[]>(() => {
      const initValues = (formConfig.schemas || []).map((s, idx) => {
        return merge(generateFromSchema(s), formConfig.defaultValues?.[idx]);
      });

      mergeState({ value: initValues });
      return initValues;
    });
    const [displayValues, setDisplayValues] = useState<Record<string, any>>({});
    const updatedDisplayValuesRef = useRef<Record<string, any>>({});

    useEffect(() => {
      subscribeMethods({
        setField({ fieldPath, value: fieldValue, displayValue }) {
          const finalFieldValue =
            fieldValue && typeof fieldValue === "object"
              ? cloneDeep(fieldValue)
              : fieldValue;
          const newValues = set(values, fieldPath, finalFieldValue);
          updatedDisplayValuesRef.current = {
            ...updatedDisplayValuesRef.current,
            ...displayValues,
            [fieldPath]: displayValue,
          };

          mergeState({
            value: newValues,
            displayValue: updatedDisplayValuesRef.current,
          });
          setValues([...newValues]);
          setDisplayValues(updatedDisplayValuesRef.current);
        },
        setDisplayValue({ fieldPath, displayValue }) {
          updatedDisplayValuesRef.current = {
            ...updatedDisplayValuesRef.current,
            ...displayValues,
            [fieldPath]: displayValue,
          };
          mergeState({
            displayValue: updatedDisplayValuesRef.current,
          });
          setDisplayValues(updatedDisplayValuesRef.current);
        },
        nextStep() {
          mergeState({
            step: step + 1,
          });
          setStep(step + 1);
        },
        apply() {
          try {
            const sdk = new KubeSdk({
              basePath,
            });
            mergeState({
              loading: true,
            });
            sdk.applyYaml(values).catch((error: { response: Response }) => {
              if (error.response) {
                error.response
                  .clone()
                  .json()
                  .then((result: any) => {
                    mergeState({
                      error: {
                        ...error,
                        responseJsonBody: result,
                      },
                    });
                  })
                  .catch(() => {});
              }
            });

            mergeState({
              loading: false,
            });
            callbackMap?.onApplySuccess?.();
          } catch (error) {}

          mergeState({
            loading: false,
          });
          callbackMap?.onApplyFail?.();
        },
        clearError() {
          mergeState({
            error: null,
          });
        },
      });
    }, [
      step,
      subscribeMethods,
      mergeState,
      values,
      callbackMap,
      basePath,
      displayValues,
    ]);
    useEffect(() => {
      if (isEqual(updatedDisplayValuesRef.current, displayValues)) {
        updatedDisplayValuesRef.current = {};
      }
    }, [displayValues]);

    return (
      <_KubectlApplyForm
        ref={elementRef}
        className={css(customStyle?.content)}
        basePath={basePath}
        applyConfig={applyConfig}
        schemas={formConfig.schemas}
        uiConfig={formConfig.uiConfig}
        values={values}
        displayValues={displayValues}
        error={error}
        errorDetail={errorDetail}
        submitting={submitting}
        step={step}
        setStep={(step) => {
          mergeState({
            step,
          });
          setStep(step);
        }}
        defaultValues={formConfig.defaultValues}
        onChange={(
          newValues: any,
          displayValues: Record<string, any>,
          key?: string,
          dataPath?: string
        ) => {
          updatedDisplayValuesRef.current = {
            ...updatedDisplayValuesRef.current,
            ...displayValues,
          };
          setValues(newValues);
          setDisplayValues(updatedDisplayValuesRef.current);
          mergeState({
            value: newValues,
            displayValue: updatedDisplayValuesRef.current,
            latestChangedKey: key,
            latestChangedPath: dataPath,
          });
          callbackMap?.onChange?.();
        }}
        onDisplayValuesChange={(displayValues: Record<string, any>) => {
          updatedDisplayValuesRef.current = {
            ...updatedDisplayValuesRef.current,
            ...displayValues,
          };
          setDisplayValues(updatedDisplayValuesRef.current);
          mergeState({
            displayValue: updatedDisplayValuesRef.current,
          });
        }}
        onNextStep={callbackMap?.onNextStep}
        onSubmit={callbackMap?.onSubmit}
        onCancel={callbackMap?.onCancel}
        getSlot={(f, fallback, slotKey) => {
          return (
            generateSlotChildren(
              {
                app,
                component,
                services,
                slotsElements,
                slot: "field",
                slotKey,
                fallback,
              },
              {
                generateId(child) {
                  return f.index !== undefined
                    ? `${child.id}_${f.index}`
                    : child.id;
                },
                generateProps() {
                  return (f as Static<typeof UiConfigFieldSpec>) || {};
                },
              }
            ) || fallback
          );
        }}
        getHelperSlot={(f, fallback, slotKey) => {
          return (
            generateSlotChildren(
              {
                app,
                component,
                services,
                slotsElements,
                slot: "helper",
                slotKey,
                fallback,
              },
              {
                generateId(child) {
                  return f.index !== undefined
                    ? `${child.id}_${f.index}`
                    : child.id;
                },
                generateProps() {
                  return (f as Static<typeof UiConfigFieldSpec>) || {};
                },
              }
            ) || fallback
          );
        }}
      />
    );
  }
);
