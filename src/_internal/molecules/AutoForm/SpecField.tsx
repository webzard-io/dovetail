import React, { useState, useEffect, useMemo, useCallback } from "react";
import isEmpty from "lodash/isEmpty";
// TODO: use kit context when I have time:)
import { Form, Col } from "antd";
import Schema, { ValidateError } from "async-validator";
import { css, cx } from "@linaria/core";
import { JSONSchema7 } from "json-schema";
import { WidgetProps } from "./widget";
import UnsupportedField from "./UnsupportedField";
import StringField from "./StringField";
import ArrayField from "./ArrayField";
import BooleanField from "./BooleanField";
import NumberField from "./NumberField";
import NullField from "./NullField";
import ObjectField from "./ObjectField";
import MultiSpecField from "./MultiSpecField";
import {
  FORM_WIDGETS_MAP,
  FORM_WIDGET_OPTIONS_MAP,
} from "../../molecules/form";
import AllFields from "../AllFields";
import { LAYOUT_WIDGETS_MAP } from "../../molecules/layout";
import { Typo } from "../../atoms/themes/CloudTower/styles/typo.style";
import { Static } from "@sinclair/typebox";
import { Field, Services, Events } from "../../organisms/KubectlApplyForm/type";

type TemplateProps = {
  id?: string;
  field?: Field;
  item?: Field["subItem"];
  itemKey: string;
  value?: any;
  services: Services;
  label?: string;
  layout?: "horizontal" | "vertical";
  error?: string;
  widgetErrors: string[];
  description?: React.ReactNode;
  hidden?: boolean;
  required?: boolean;
  displayLabel?: boolean;
  labelWidth?: number;
  displayDescription?: boolean;
  spec: WidgetProps["spec"];
  testId?: string;
  children?: React.ReactNode;
};

export const HasMargin = css`
  margin-bottom: 16px;
`;

export const FieldSection = css`
  font-weight: 700;
  color: #2d3a56;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(213, 219, 227, 0.6);
  margin-bottom: 16px;
  display: block;
  width: 100%;
`;

const FormItemStyle = css`
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }

  &.dovetail-ant-form-item
    > .dovetail-ant-form-item-control
    > .dovetail-ant-form-item-explain {
    display: none;
  }

  &.dovetail-ant-form-item-has-error {
    & > .dovetail-ant-form-item-control > .dovetail-ant-form-item-explain {
      display: block;
    }
  }

  .dovetail-ant-form-item-label {
    padding: 0;
    font-family: "Inter";
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    word-break: break-word;
    white-space: pre-wrap;

    label:after {
      content: "";
    }
  }

  .dovetail-ant-form-item-control {
    flex: 1;
    min-width: 0;
  }

  .dovetail-ant-form-item-extra {
    margin-top: 5px;
    color: rgba(44, 56, 82, 0.6);
    font-family: "Inter";
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;

    &:empty {
      display: none;
    }
  }

  &.dovetail-ant-form-item-has-error .ant-select-selector,
  &.dovetail-ant-form-item-has-error .ant-input {
    border-color: #f0483e !important;
  }
`;

const FormItemLabelStyle = css`
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: rgba(44, 56, 82, 0.6);
  width: 108px;
`;

const FormItem = React.forwardRef<HTMLDivElement, TemplateProps>(
  function FormItem(props, ref) {
    const {
      field,
      item,
      value,
      itemKey,
      services,
      label,
      children,
      error,
      widgetErrors,
      description,
      hidden,
      displayLabel,
      labelWidth,
      displayDescription,
      testId,
    } = props;
    const [errors, setErrors] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const fieldOrItem = field || item;
    const validator = useMemo(
      () =>
        new Schema({
          value: (fieldOrItem?.rules || []).map((rule) => ({
            ...rule,
            type: value instanceof Array ? "array" : rule.type,
            pattern: rule.pattern ? new RegExp(rule.pattern, "g") : undefined,
          })),
        }),
      [fieldOrItem?.rules, value]
    );
    const finalError = error || errors?.[0] || widgetErrors[0] || "";

    const validate = useCallback(
      (callback?: (messages: string[]) => void) => {
        validator.validate({ value }, {}, (newErrors: ValidateError[]) => {
          const newErrorsMessages = (newErrors || []).map(
            ({ message }) => message
          );

          setErrors(newErrorsMessages);
          callback?.(newErrorsMessages);
        });
      },
      [validator, value]
    );
    const onValidate = useCallback(
      ({ result }: Events["validate"]) => {
        validate((messages: string[]) => {
          result[itemKey] = error
            ? messages.concat(error, widgetErrors)
            : messages;
        });
      },
      [itemKey, error, widgetErrors, validate]
    );

    useEffect(() => {
      if (isMounted) {
        validate();
      }
    }, [value]);
    useEffect(() => {
      services.event.on("validate", onValidate);

      return () => {
        services.event.off("validate", onValidate);
      };
    }, [services.event, onValidate]);
    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (hidden) {
      return <div className="hidden">{children}</div>;
    }

    return (
      <Form.Item
        className={FormItemStyle}
        labelAlign="left"
        label={
          displayLabel ? (
            <span
              style={{ width: labelWidth || `${108}px` }}
              className={cx(Typo.Label.l3_regular_title, FormItemLabelStyle)}
            >
              {label}
            </span>
          ) : (
            ""
          )
        }
        validateStatus={finalError ? "error" : ""}
        help={finalError}
        extra={description && displayDescription ? description : ""}
      >
        <div data-test-id={testId}>{children}</div>
      </Form.Item>
    );
  }
);

function shouldDisplayDescription(spec: JSONSchema7): boolean {
  if (spec.type === "object") {
    return false;
  }
  return true;
}

type SpecFieldProps = Omit<WidgetProps, "setWidgetErrors"> & {
  children?: React.ReactNode;
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
  let { widgetOptions = {} } = props;
  const [widgetErrors, setWidgetErrors] = useState([]);
  const { title } = spec;
  const label = title ?? "";
  const fieldOrItem = field || item;
  let isDisplayLabel =
    field?.type === "layout" ? field.indent : field?.isDisplayLabel;
  const displayDescription = shouldDisplayDescription(spec);
  const itemKey = `${
    props.superiorKey
      ? `${props.superiorKey}${props.field?.key ? "-" : ""}`
      : ""
  }${props.field?.key || ""}`;

  if (isEmpty(spec) || field?.condition === false) {
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
  } else if (field?.path.includes("*")) {
    Component = AllFields;
  } else if (field?.path.includes("metadata.namespace")) {
    Component = FORM_WIDGETS_MAP.k8sSelect;
    widgetOptions = {
      apiBase: "/api/v1",
      basePath,
      resource: "namespaces",
      valuePath: "metadata.name",
      ...widgetOptions,
    } as Static<typeof FORM_WIDGET_OPTIONS_MAP.k8sSelect>;
  } else if (
    field?.path.includes("metadata.annotations") ||
    path.endsWith("metadata.annotations") ||
    field?.path.includes("metadata.labels") ||
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
      field={field}
      item={item}
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
      span={field?.col || 24}
      style={{
        boxShadow: field?.splitLine
          ? "inset 0px -1px 0px rgba(211, 218, 235, 0.6)"
          : "",
      }}
    >
      {field?.sectionTitle && (
        <div className={FieldSection}>{field?.sectionTitle}</div>
      )}
      <FormItem
        services={services}
        field={field}
        item={item}
        itemKey={itemKey}
        value={value}
        label={label}
        layout={field?.layout}
        description={
          helperSlot?.(
            { path, ...(field || {}), index },
            field?.helperText || "",
            `helper_${path}`
          ) || field?.helperText
        }
        labelWidth={field?.labelWidth}
        displayLabel={isDisplayLabel}
        displayDescription={displayDescription}
        spec={spec}
        error={typeof error === "string" ? error : ""}
        widgetErrors={widgetErrors}
        testId={`${path}-${field?.key || ""}`}
      >
        {slot?.(
          { path, ...(field || {}), itemKey, index },
          FieldComponent,
          `filed_${path}`
        ) || FieldComponent}
      </FormItem>
    </Col>
  );
};

export default SpecField;
