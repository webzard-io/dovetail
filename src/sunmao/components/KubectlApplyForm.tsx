import { Type, Static } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { PRESET_PROPERTY_CATEGORY, StringUnion } from "@sunmao-ui/shared";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import set from "lodash/set";
import useMergeState from "../hooks/useMergeState";
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
const EDITOR_CATEGORY = "Editor";
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
  tooltip: Type.String({
    title: "Tooltip",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  isDisplaySwitchEditor: Type.Boolean({
    title: "Enable switch to editor",
    category: EDITOR_CATEGORY,
  }),
  isDisabledSwitchEditor: Type.Boolean({
    title: "Disable switch",
    category: EDITOR_CATEGORY,
  }),
  editorSwitchTooltip: Type.String({
    title: "The tooltip of editor switch",
    category: EDITOR_CATEGORY,
  }),
  editorHeight: Type.String({
    title: "The height of editor",
    category: EDITOR_CATEGORY,
    defaultValue: "500px",
  }),
  editorFormatError: Type.String({
    title: "Editor format error",
    category: EDITOR_CATEGORY,
    defaultValue: "",
  }),
  editorSchemaError: Type.String({
    title: "Editor schema error",
    category: EDITOR_CATEGORY,
    defaultValue: "",
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
    title: "Hide Error",
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
  )
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
  titleGap: Type.String({
    title: "Title gap",
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
  defaultValue: Type.Any(),
  displayValue: Type.Any(),
  latestChangedKey: Type.String(),
  latestChangedPath: Type.String(),
  step: Type.Number(),
  loading: Type.Boolean(),
  error: Type.Any(),
  enabledEditorMap: Type.Record(Type.String(), Type.Boolean()),
  isValid: Type.Boolean(),
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
        strategy: StringUnion(
          ["application/merge-patch+json", "application/apply-patch+yaml", "application/json-patch+json"],
          { category: PRESET_PROPERTY_CATEGORY.Basic }
        ),
        transformMap: Type.Record(Type.String(), Type.Any()),
        replacePaths: Type.Array(
          Type.Array(Type.String()),
          { conditions: [{ key: "strategy", value: "application/json-patch+json" }] }
        ),
      }),
      clearError: Type.Object({}),
      validateForm: Type.Object({}),
    },
    slots: {
      field: {
        slotProps: UiConfigFieldSpec,
      },
      helper: {
        slotProps: UiConfigFieldSpec,
      },
      label: {
        slotProps: UiConfigFieldSpec,
      }
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
    childrenMap,
    mergeState,
    subscribeMethods,
  }) => {
    const [step, setStep] = useState(0);
    const enabledEditorMapRef = useRef<Record<string, boolean>>({});
    const {
      value: values,
      mergeValue: mergeValues,
      valueRef: valuesRef,
      setValue: setValues
    } = useMergeState<any[]>(() => {
      const initValues = (formConfig.schemas || []).map((s, idx) => {
        return formConfig.defaultValues?.[idx];
      });

      mergeState({ value: initValues });
      return initValues;
    });
    const {
      value: displayValues,
      mergeValue: mergeDisplayValues,
      valueRef: displayValuesRef,
      setValue: setDisplayValues
    } = useMergeState<Record<string, any>>({});
    const ref = useRef<KubectlApplyFormRef>(null);
    const slotContext = useMemo(() => ({
      app,
      component,
      allComponents,
      services,
      slotsElements,
      childrenMap,
    }), [app, component, allComponents, services, slotsElements, childrenMap]);

    const generateSlot = useCallback((slot: string) => {
      return (field: FormItemData, fallback: React.ReactNode, slotKey: string) => {
        return (
          generateSlotChildren(
            {
              ...slotContext,
              slot,
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
      };
    }, [slotContext]);
    const setEnabledEditorMap = useCallback((newMap: Record<string, boolean>) => {
      enabledEditorMapRef.current = newMap;
      mergeState({
        enabledEditorMap: enabledEditorMapRef.current,
      });
    }, [mergeState]);
    const changeStep = useCallback(
      (newStep) => {
        mergeState({
          step: newStep,
        });
        setStep(newStep);
      },
      [mergeState]
    );
    const onChange = useCallback((
      newValues: any,
      displayValues: Record<string, any>,
      key?: string,
      dataPath?: string
    ) => {
      setValues(newValues);
      setDisplayValues(displayValues);
      mergeState({
        value: valuesRef.current,
        displayValue: displayValuesRef.current,
        latestChangedKey: key,
        latestChangedPath: dataPath,
      });
      callbackMap?.onChange?.();
    }, [callbackMap, mergeState, setDisplayValues, setValues, valuesRef, displayValuesRef]);
    const onDisplayValuesChange = useCallback((displayValues: Record<string, any>) => {
      mergeDisplayValues(displayValues);
      mergeState({
        displayValue: displayValuesRef.current,
      })
    }, [mergeDisplayValues, mergeState, displayValuesRef]);
    const getSlot = useCallback(generateSlot("field"), [slotContext]);
    const getHelperSlot = useCallback(generateSlot("helper"), [slotContext]);
    const getLabelSlot = useCallback(generateSlot("label"), [slotContext]);

    useEffect(() => {
      subscribeMethods({
        setField({ fieldPath, value: fieldValue, displayValue }) {
          const finalFieldValue =
            fieldValue && typeof fieldValue === "object"
              ? cloneDeep(fieldValue)
              : fieldValue;
          const newValues = immutableSet(valuesRef.current, fieldPath, finalFieldValue) as any[];
          const newDisplayValues = {
            ...displayValuesRef.current,
            [fieldPath]: displayValue,
          };

          setValues(newValues);
          mergeDisplayValues(newDisplayValues);
          mergeState({
            value: valuesRef.current,
            displayValue: displayValuesRef.current,
          })
        },
        setDisplayValue({ fieldPath, displayValue }) {
          const newDisplayValues = {
            ...displayValues,
            [fieldPath]: displayValue,
          };

          mergeDisplayValues(newDisplayValues);
          mergeState({
            displayValue: displayValuesRef.current,
          })
        },
        validateForm() {
          let result: Record<string, string[]> = {};

          if (ref.current) {
            result = ref.current.validate();
          }

          mergeState({
            isValid: Object.values(result).every(error=> !error),
          });
        },
        nextStep({ disabled }) {
          let result: Record<string, string[]> = {};

          if (ref.current) {
            result = ref.current.validate();
          }

          mergeState({
            isValid: Object.values(result).every(error=> !error),
          });

          if (
            Object.values(result).every((messages) => messages.length === 0) &&
            !disabled
          ) {
            changeStep(step + 1);
          }
        },
        async apply({ disabled, transformMap, strategy, replacePaths }) {
          try {
            let result: Record<string, string[]> = {};

            if (ref.current) {
              result = ref.current.validate();
            }

            mergeState({
              isValid: Object.values(result).every(error=> !error),
            });

            if (
              Object.values(result).every(
                (messages) => messages.length === 0
              ) &&
              !disabled
            ) {
              const sdk = new KubeSdk({
                basePath,
              });
              let transformedValues = valuesRef.current;

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

              await sdk.applyYaml(appliedValues, strategy, replacePaths);

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
      mergeValues,
      mergeDisplayValues,
      changeStep,
      formConfig.schemas,
      displayValuesRef,
      valuesRef,
      setValues,
    ]);
    useEffect(() => {
      mergeState({ defaultValue: formConfig.defaultValues });
    }, [formConfig.defaultValues, mergeState]);

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
        enabledEditorMap={enabledEditorMapRef.current}
        setEnabledEditorMap={setEnabledEditorMap}
        onChange={onChange}
        onDisplayValuesChange={onDisplayValuesChange}
        onNextStep={callbackMap?.onNextStep}
        onSubmit={callbackMap?.onSubmit}
        onCancel={callbackMap?.onCancel}
        getSlot={getSlot}
        getHelperSlot={getHelperSlot}
        getLabelSlot={getLabelSlot}
      />
    );
  }
);
