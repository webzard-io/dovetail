import { Type, Static } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { PRESET_PROPERTY_CATEGORY, StringUnion } from "@sunmao-ui/shared";
import React, { useEffect, useState, useRef, useCallback } from "react";
import set from "lodash/set";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import pick from "lodash/pick";
import _KubectlApplyForm, {
  CUSTOM_SCHEMA_KIND,
  KubectlApplyFormRef,
} from "../../_internal/organisms/KubectlApplyForm/KubectlApplyForm";
import { FormItemData } from "../../_internal/organisms/KubectlApplyForm/type";
import { css } from "@emotion/css";
import {
  FORM_WIDGETS_MAP,
  FORM_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/form";
import { LAYOUT_WIDGETS_MAP } from "../../_internal/molecules/layout";
import { KubeSdk } from "../../_internal/k8s-api-client/kube-api";
import { generateSlotChildren } from "../utils/slot";
import { immutableSet } from "../utils/object";
import registry from "../../services/Registry";

const LABEL_CATEGORY = "Label Style";
const VALIDATION_CATEGORY = "Validation";
const WIDGET_CATEGORY = "Widget";
const SUMMARY_CATEGORY = "Summary List";
const STATUS_CATEGORY = "Status";
const FIELD_CONDITIONS = [
  {
    or: [
      {
        key: "type",
        value: "field",
      },
      {
        key: "type",
        value: undefined as any,
      },
    ],
  },
];
const LAYOUT_CONDITION = [
  {
    key: "type",
    value: "layout",
  },
];

const ValidationRuleProperties = {
  message: Type.String({
    title: "Message",
  }),
  required: Type.Boolean({
    title: "Required",
  }),
  pattern: Type.String({
    title: "RegExp",
  }),
  min: Type.Number({
    title: "Min",
  }),
  max: Type.Number({
    title: "Max",
    default: Number.MAX_SAFE_INTEGER,
  }),
  validatorType: StringUnion(
    ["custom"].concat(Array.from(registry.validators.keys())),
    {
      title: "Validator type",
    }
  ),
  validator: Type.Any({
    title: "Validator",
  }),
};

const UiConfigFieldSpecProperties = {
  path: Type.String({
    title: "Path",
    widget: "kui/v1/PathWidget",
    conditions: FIELD_CONDITIONS,
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  key: Type.String({
    title: "Key",
    description: "Use for the `latestChangedKey` state",
    conditions: FIELD_CONDITIONS,
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  label: Type.String({
    title: "Label",
    conditions: FIELD_CONDITIONS,
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  condition: Type.Boolean({
    title: "Is display",
    category: PRESET_PROPERTY_CATEGORY.Basic,
    default: true,
  }),
  helperText: Type.String({
    title: "Helper text",
    conditions: FIELD_CONDITIONS,
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  sectionTitle: Type.String({
    title: "Section title",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  isDisplayLabel: Type.Boolean({
    title: "Is display label",
    conditions: FIELD_CONDITIONS,
    category: LABEL_CATEGORY,
    default: true,
  }),
  labelWidth: Type.Number({
    title: "Label Width",
    conditions: FIELD_CONDITIONS,
    category: LABEL_CATEGORY,
  }),
  layout: StringUnion(["horizontal", "vertical"], {
    title: "Layout of label and input",
    conditions: FIELD_CONDITIONS,
    category: LABEL_CATEGORY,
  }),
  disabledValidation: Type.Boolean({
    title: "Disabled Validation",
    category: VALIDATION_CATEGORY,
  }),
  rules: Type.Array(Type.Object(ValidationRuleProperties), {
    title: "Validation rules",
    widget: "core/v1/array",
    conditions: FIELD_CONDITIONS,
    widgetOptions: {
      displayedKeys: ["message"],
      appendToBody: true,
    },
    category: VALIDATION_CATEGORY,
  }),
  error: Type.String({
    title: "Error",
    conditions: FIELD_CONDITIONS,
    category: VALIDATION_CATEGORY,
  }),
  isHideError: Type.Boolean({
    title: 'Hide Error',
    conditions: FIELD_CONDITIONS,
    category: VALIDATION_CATEGORY,
  }),
  col: Type.Number({
    title: "Col",
    conditions: FIELD_CONDITIONS,
    default: 24,
    category: PRESET_PROPERTY_CATEGORY.Style,
  }),
  splitLine: Type.Boolean({
    title: "Split line",
    category: PRESET_PROPERTY_CATEGORY.Style,
  }),
  widget: StringUnion(
    ["default", "component"].concat(Object.keys(FORM_WIDGETS_MAP)),
    {
      title: "Widget",
      conditions: FIELD_CONDITIONS,
      category: WIDGET_CATEGORY,
    }
  ),
  widgetOptions: Type.Record(Type.String(), Type.Any(), {
    title: "Widget options",
    widget: "kui/v1/OptionsWidget",
    widgetOptions: {
      optionsMap: FORM_WIDGET_OPTIONS_MAP,
    },
    category: WIDGET_CATEGORY,
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
    category: WIDGET_CATEGORY,
  }),
  summaryConfig: Type.Object(
    {
      type: StringUnion(["auto", "item"]),
      label: Type.String(),
      value: Type.String(),
      icon: Type.String(),
      hidden: Type.Boolean(),
    },
    {
      title: "Summary list config",
      category: SUMMARY_CATEGORY,
    }
  ),
};
const UiConfigFieldSpec = Type.Object(
  {
    type: StringUnion(["field", "layout"], {
      title: "Choose Config",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    ...UiConfigFieldSpecProperties,
    layoutWidget: StringUnion(Object.keys(LAYOUT_WIDGETS_MAP), {
      title: "Layout Widget",
      conditions: LAYOUT_CONDITION,
      category: WIDGET_CATEGORY,
    }),
    indent: Type.Boolean({
      title: "Indent",
      conditions: LAYOUT_CONDITION,
      category: PRESET_PROPERTY_CATEGORY.Style,
    }),
    fields: Type.Array(
      Type.Object(UiConfigFieldSpecProperties, {
        widget: "kui/v1/KubectlApplyFormFieldWidget",
      }),
      {
        title: "Fields",
        widget: "core/v1/array",
        widgetOptions: { displayedKeys: ["path", "label"], appendToBody: true },
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }
    ),
    subItem: Type.Object(
      {
        ...pick(UiConfigFieldSpecProperties, [
          "widget",
          "widgetOptions",
          "componentId",
          "disabledValidation",
          "rules",
        ]),
      },
      {
        title: "Sub item",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }
    ),
  },
  {
    widget: "kui/v1/KubectlApplyFormFieldWidget",
  }
);

export const UiConfigSpec = Type.Object({
  title: Type.String({
    title: "Title",
    category: PRESET_PROPERTY_CATEGORY.Basic,
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
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }
  ),
  confirmText: Type.String({
    title: "Confirm text",
    category: PRESET_PROPERTY_CATEGORY.Basic,
    conditions: [
      {
        key: "isDisplayFooter",
        value: true,
      },
    ],
  }),
  cancelText: Type.String({
    title: "Cancel text",
    category: PRESET_PROPERTY_CATEGORY.Basic,
    conditions: [
      {
        key: "isDisplayFooter",
        value: true,
      },
    ],
  }),
  allowToggleYaml: Type.Boolean({
    title: "Allow toggle YAML",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
    default: true,
  }),
  isDisplaySummary: Type.Boolean({
    title: "Is display summary",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
    default: true,
  }),
  isDisplayFooter: Type.Boolean({
    title: "Is display footer",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
    default: true,
  }),
});

const KubectlApplyFormProps = Type.Object({
  basePath: Type.String({
    title: "Base path",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
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
  submitting: Type.Boolean({
    title: "Submitting",
    category: STATUS_CATEGORY,
  }),
  error: Type.String({
    title: "Error text",
    category: STATUS_CATEGORY,
  }),
  errorDetail: Type.Object(
    {
      title: Type.String({ title: "Title" }),
      errors: Type.Array(Type.String(), { title: "Errors" }),
    },
    {
      title: "Error detail",
      category: STATUS_CATEGORY,
    }
  ),
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
      nextStep: Type.Object({
        disabled: Type.Boolean(),
      }),
      apply: Type.Object({
        disabled: Type.Boolean(),
        transformMap: Type.Record(Type.String(), Type.Any()),
      }),
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
    formConfig,
    error,
    errorDetail,
    submitting,
    app,
    allComponents,
    component,
    services,
    slotsElements,
    customStyle,
    callbackMap,
    elementRef,
    mergeState,
    subscribeMethods,
  }) => {
    const [step, setStep] = useState(0);
    const [values, setValues] = useState<any[]>(() => {
      const initValues = (formConfig.schemas || []).map((s, idx) => {
        return formConfig.defaultValues?.[idx];
      });

      mergeState({ value: initValues });
      return initValues;
    });
    const [displayValues, setDisplayValues] = useState<Record<string, any>>({});
    const ref = useRef<KubectlApplyFormRef>(null);
    const updatedDisplayValuesRef = useRef<Record<string, any>>({});

    const changeStep = useCallback(
      (newStep) => {
        mergeState({
          step: newStep,
        });
        setStep(newStep);
      },
      [mergeState]
    );

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
        nextStep({ disabled }) {
          let result: Record<string, string[]> = {};

          if (ref.current) {
            result = ref.current.validate();
          }

          if (
            Object.values(result).every((messages) => messages.length === 0) &&
            !disabled
          ) {
            changeStep(step + 1);
          }
        },
        async apply({ disabled, transformMap }) {
          try {
            let result: Record<string, string[]> = {};

            if (ref.current) {
              result = ref.current.validate();
            }

            if (
              Object.values(result).every(
                (messages) => messages.length === 0
              ) &&
              !disabled
            ) {
              const sdk = new KubeSdk({
                basePath,
              });
              let transformedValues = values;

              Object.keys(transformMap || {}).forEach((path) => {
                const transformedValue = transformMap[path];

                transformedValues = immutableSet(
                  transformedValues,
                  path,
                  transformedValue
                ) as any[];
              });
              const appliedValues = transformedValues.filter(
                (value, index) => !formConfig.schemas[index][CUSTOM_SCHEMA_KIND]
              );

              mergeState({
                loading: true,
                error: null,
              });

              await sdk.applyYaml(appliedValues);

              mergeState({
                loading: false,
              });
              callbackMap?.onApplySuccess?.();
            }
          } catch (error: any) {
            if (error.response) {
              error.response
                .clone()
                .json()
                .then((result: unknown) => {
                  mergeState({
                    error: {
                      ...(error || {}),
                      responseJsonBody: result,
                    },
                  });
                });
            } else {
              mergeState({
                error
              });
            }

            mergeState({
              loading: false,
            })

            callbackMap?.onApplyFail?.();
          }
        },
        clearError() {
          mergeState({
            error: null,
          });
        },
      });
    }, [
      step,
      values,
      displayValues,
      callbackMap,
      basePath,
      subscribeMethods,
      mergeState,
      changeStep,
      formConfig.schemas,
    ]);
    useEffect(() => {
      if (isEqual(updatedDisplayValuesRef.current, displayValues)) {
        updatedDisplayValuesRef.current = {};
      }
    }, [displayValues]);

    if (ref.current && elementRef) {
      elementRef.current = ref.current.getElementRef().current;
    }

    return (
      <_KubectlApplyForm
        ref={ref}
        className={css(customStyle?.content)}
        basePath={basePath}
        schemas={formConfig.schemas}
        uiConfig={formConfig.uiConfig}
        values={values}
        displayValues={displayValues}
        error={error}
        errorDetail={errorDetail}
        submitting={submitting}
        step={step}
        setStep={changeStep}
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
        getSlot={(field: FormItemData, fallback, slotKey) => {
          return (
            generateSlotChildren(
              {
                app,
                component,
                allComponents,
                services,
                slotsElements,
                slot: "field",
                slotKey,
                fallback,
              },
              {
                generateId(child) {
                  return field.index !== undefined
                    ? `${child.id}_${field.index}`
                    : child.id;
                },
                generateProps() {
                  return (field as Static<typeof UiConfigFieldSpec>) || {};
                },
              }
            ) || fallback
          );
        }}
        getHelperSlot={(field: FormItemData, fallback, slotKey) => {
          return (
            generateSlotChildren(
              {
                app,
                component,
                allComponents,
                services,
                slotsElements,
                slot: "helper",
                slotKey,
                fallback,
              },
              {
                generateId(child) {
                  return field.index !== undefined
                    ? `${child.id}_${field.index}`
                    : child.id;
                },
                generateProps() {
                  return (field as Static<typeof UiConfigFieldSpec>) || {};
                },
              }
            ) || fallback
          );
        }}
      />
    );
  }
);
