import React, { useState, useCallback, useContext, useRef } from "react";
import isEmpty from "lodash/isEmpty";
// TODO: use kit context when I have time:)
import { Col } from "antd";
import { css, cx } from "@linaria/core";
import { JSONSchema7 } from "json-schema";
import { WidgetProps } from "../widget";
import UnsupportedField from "../UnsupportedField";
import StringField from "../StringField";
import ArrayField from "../ArrayField";
import BooleanField from "../BooleanField";
import NumberField from "../NumberField";
import NullField from "../NullField";
import ObjectField from "../ObjectField";
import MultiSpecField from "../MultiSpecField";
import {
  FORM_WIDGETS_MAP,
  FORM_WIDGET_OPTIONS_MAP,
} from "../../form";
import AllFields from "../../AllFields";
import { LAYOUT_WIDGETS_MAP } from "../../layout";
import { Static } from "@sinclair/typebox";
import { KitContext } from "../../../atoms/kit-context";
import FormItem from "./FormItem";
import FormEditor, { FormEditorHandle } from "./FormEditor";
import { useTranslation } from "react-i18next";
import { Typo } from "../../../atoms/themes/CloudTower/styles/typo.style";

export const FieldSection = css`
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(213, 219, 227, 0.6);
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  
    .title {
      font-weight: 700;
      color: #2d3a56;
    }
  `;

const EditYAMLTextStyle = css`
  color: rgba(44, 56, 82, 0.60);
  margin-right: 16px;
`;

function shouldDisplayDescription(spec: JSONSchema7): boolean {
  if (spec.type === "object") {
    return false;
  }
  return true;
}

type SpecFieldProps = Omit<WidgetProps, "setWidgetErrors"> & {
  children?: React.ReactNode;
};

type TransformFuncProps<T> = T extends Record<string, unknown>
  ? {
    [K in keyof T]: T[K] extends (...args: any[]) => unknown
    ? ReturnType<T[K]>
    : T[K];
  }
  : never;

const transformFuncProps = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  obj: T,
  params: Record<string, unknown>
): TransformFuncProps<T> => {
  return Object.keys(obj).reduce((result: Partial<T>, key) => {
    const value = obj[key as keyof T];
    if (typeof value === "function") {
      result[key as keyof T] = value(params);
    } else {
      result[key as keyof T] = value as T[keyof T];
    }
    return result;
  }, {}) as TransformFuncProps<T>;
};

const SpecField: React.FC<SpecFieldProps> = (props) => {
  const {
    services,
    specsArray,
    basePath,
    field,
    item,
    spec,
    widget,
    level,
    path,
    value,
    displayValues,
    superiorKey: subKey,
    error,
    index,
    slot,
    helperSlot,
    onChange,
    onDisplayValuesChange,
  } = props;
  const { i18n } = useTranslation();
  let { widgetOptions = {} } = props;
  const editorRef = useRef<FormEditorHandle>(null);
  const kit = useContext(KitContext);
  const [widgetErrors, setWidgetErrors] = useState([]);
  const [isEnableEditor, setIsEnableEditor] = useState(false);
  const { title } = spec;
  const transformedField = field ? transformFuncProps(field, { index }) : field;
  const transformedItem = item ? transformFuncProps(item, { index }) : item;
  const fieldOrItem = transformedField || transformedItem;
  const label = transformedField?.label || title || "";
  let isDisplayLabel =
    transformedField?.type === "layout"
      ? transformedField.indent
      : transformedField?.isDisplayLabel;
  const displayDescription = shouldDisplayDescription(spec);
  const itemKey = `${props.superiorKey
    ? `${props.superiorKey}${transformedField?.key ? "-" : ""}`
    : ""
    }${transformedField?.key || ""}`;
  const finalError = error || fieldOrItem?.error;

  const onEnableEditorChange = useCallback((enabled) => {
    if (!enabled) {
      editorRef.current?.validate((errors, newVal) => {
        if (!errors.length) {
          setIsEnableEditor(enabled);
          onChange(newVal, displayValues, transformedField?.key, transformedField?.path);
        }
      })
    } else {
      setIsEnableEditor(enabled);
    }
  }, [displayValues, onChange, transformedField?.key, transformedField?.path]);

  if (isEmpty(spec) || transformedField?.condition === false) {
    return null;
  }

  let Component: React.FC<any> = UnsupportedField;

  // type fields
  if (widget && widget in FORM_WIDGETS_MAP && fieldOrItem?.type !== "layout") {
    Component = FORM_WIDGETS_MAP[widget as keyof typeof FORM_WIDGETS_MAP];
  } else if (
    fieldOrItem?.type === "layout" &&
    fieldOrItem.layoutWidget &&
    fieldOrItem.layoutWidget in LAYOUT_WIDGETS_MAP
  ) {
    Component =
      LAYOUT_WIDGETS_MAP[
      fieldOrItem.layoutWidget as keyof typeof LAYOUT_WIDGETS_MAP
      ];
  } else if (transformedField?.path.includes("*")) {
    Component = AllFields;
  } else if (transformedField?.path.includes("metadata.namespace")) {
    Component = FORM_WIDGETS_MAP.k8sSelect;
    widgetOptions = {
      apiBase: "/api/v1",
      basePath,
      resource: "namespaces",
      valuePath: "metadata.name",
      ...widgetOptions,
    } as Static<typeof FORM_WIDGET_OPTIONS_MAP.k8sSelect>;
  } else if (
    transformedField?.path.includes("metadata.annotations") ||
    path.endsWith("metadata.annotations") ||
    transformedField?.path.includes("metadata.labels") ||
    path.endsWith("metadata.labels")
  ) {
    Component = FORM_WIDGETS_MAP.k8sLabelGroup;
  } else if (spec.type === "object") {
    Component = ObjectField;
    isDisplayLabel = isDisplayLabel ?? false;
  } else if (spec.type === "string") {
    Component = StringField;
  } else if (spec.type === "array") {
    Component = ArrayField;
    isDisplayLabel = isDisplayLabel ?? false;
  } else if (spec.type === "boolean") {
    Component = BooleanField;
  } else if (spec.type === "integer" || spec.type === "number") {
    Component = NumberField;
  } else if (spec.type === "null") {
    Component = NullField;
  } else if ("anyOf" in spec || "oneOf" in spec) {
    Component = MultiSpecField;
  } else if (path) {
    console.info("Found unsupported spec", spec);
  }

  isDisplayLabel = isDisplayLabel ?? !!label;

  const FieldComponent = (
    <Component
      basePath={basePath}
      services={services}
      fieldsArray={specsArray}
      itemKey={itemKey}
      widgetOptions={widgetOptions}
      error={typeof error !== "string" ? error : undefined}
      setWidgetErrors={setWidgetErrors}
      field={transformedField}
      item={transformedItem}
      spec={spec}
      value={value}
      displayValues={displayValues}
      path={path}
      subKey={subKey}
      level={level}
      onChange={onChange}
      onDisplayValuesChange={onDisplayValuesChange}
      slot={slot}
      helperSlot={helperSlot}
    />
  );

  return (
    <Col
      span={transformedField?.col || 24}
      style={{
        boxShadow: transformedField?.splitLine
          ? "inset 0px -1px 0px rgba(211, 218, 235, 0.6)"
          : "",
      }}
    >
      {transformedField?.sectionTitle && (
        <div className={FieldSection}>
          <span className="section-title-text">{transformedField?.sectionTitle}</span>
          {transformedField.enableSwitchEditor && value instanceof Object ? (
            <span>
              <span className={cx(Typo.Label.l4_regular, EditYAMLTextStyle)}>{i18n.t("dovetail.edit_yaml")}</span>
              <kit.Switch checked={isEnableEditor} onChange={onEnableEditorChange}></kit.Switch>
            </span>
          ) : null}
        </div>
      )}
      {
        isEnableEditor ? (
          <FormEditor
            ref={editorRef}
            services={services}
            field={transformedField}
            item={transformedItem}
            itemKey={itemKey}
            value={value}
            layout={transformedField?.layout}
            spec={spec}
            error={typeof finalError === "string" ? finalError : ""}
            widgetErrors={widgetErrors}
            displayValues={displayValues}
            onChange={onChange}
          />
        ) : (
          <FormItem
            services={services}
            field={transformedField}
            item={transformedItem}
            itemKey={itemKey}
            value={value}
            label={label}
            layout={transformedField?.layout}
            description={
              helperSlot?.(
                { path, ...(transformedField || {}), index },
                transformedField?.helperText || "",
                `helper_${path}`
              ) || transformedField?.helperText
            }
            labelWidth={transformedField?.labelWidth}
            displayLabel={isDisplayLabel}
            displayDescription={displayDescription}
            spec={spec}
            error={typeof finalError === "string" ? finalError : ""}
            widgetErrors={widgetErrors}
            testId={`${path}-${transformedField?.key || ""}`}
          >
            {slot?.(
              { path, ...(transformedField || {}), itemKey, index },
              FieldComponent,
              `filed_${path}`
            ) || FieldComponent}
          </FormItem>

        )
      }
    </Col>
  );
};

export default SpecField;
