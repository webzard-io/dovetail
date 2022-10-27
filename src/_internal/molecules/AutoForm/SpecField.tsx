import React from "react";
import isEmpty from "lodash/isEmpty";
// TODO: use kit context when I have time:)
import { Form, Col } from "antd";
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
import { Typo } from "../../atoms/themes/CloudTower/styles/typo.style";
import { Static } from "@sinclair/typebox";

type TemplateProps = {
  id?: string;
  label?: string;
  layout?: "horizontal" | "vertical";
  error?: string;
  description?: string;
  hidden?: boolean;
  required?: boolean;
  displayLabel?: boolean;
  labelWidth?: number;
  displayDescription?: boolean;
  spec: WidgetProps["spec"];
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

    label:after {
      content: "";
    }
  }

  .dovetail-ant-form-item-control {
    flex: 1;
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

const FormItemContentStyle = css``;

const DefaultTemplate: React.FC<TemplateProps> = (props) => {
  const {
    id,
    layout,
    label,
    children,
    error,
    description,
    hidden,
    required,
    displayLabel,
    labelWidth,
    displayDescription,
    spec,
  } = props;
  const isHorizontal = layout === "horizontal" || layout === undefined;

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
            style={{ width: labelWidth || 108 + "px" }}
            className={cx(Typo.Label.l3_regular_title, FormItemLabelStyle)}
          >
            {label}
          </span>
        ) : (
          ""
        )
      }
      validateStatus={error ? "error" : ""}
      help={error}
      extra={description && displayDescription ? description : ""}
    >
      <div className={FormItemContentStyle}>{children}</div>
    </Form.Item>
  );
};

function shouldDisplayLabel(spec: JSONSchema7, label: string): boolean {
  if (!label) {
    return false;
  }
  if (spec.type === "object") {
    return false;
  }
  return true;
}

function shouldDisplayDescdisplayDescription(spec: JSONSchema7): boolean {
  if (spec.type === "object") {
    return false;
  }
  return true;
}

type SpecFieldProps = WidgetProps & {
  children?: React.ReactNode;
};

const SpecField: React.FC<SpecFieldProps> = (props) => {
  const {
    basePath,
    field,
    spec,
    widget,
    level,
    path,
    step,
    value,
    stepElsRef,
    layout,
    subKey,
    error,
    index,
    slot,
    helperSlot,
    onChange,
  } = props;
  let { widgetOptions = {} } = props;
  const { title } = spec;
  const label = title ?? "";
  const displayLabel = field?.isDisplayLabel ?? shouldDisplayLabel(spec, label);
  const displayDescription = shouldDisplayDescdisplayDescription(spec);

  if (isEmpty(spec) || field?.condition === false) {
    return null;
  }

  let Component: React.FC<any> = UnsupportedField;
  let isNest = false;

  // type fields
  if (widget && widget in FORM_WIDGETS_MAP) {
    Component = FORM_WIDGETS_MAP[widget as keyof typeof FORM_WIDGETS_MAP];
  } else if (field?.path.includes("metadata.namespace")) {
    Component = FORM_WIDGETS_MAP.k8sSelect;
    widgetOptions = {
      apiBase: "/api/v1",
      basePath,
      resource: "namespaces",
      valuePath: "metadata.name",
      ...widgetOptions,
    } as Static<typeof FORM_WIDGET_OPTIONS_MAP.k8sSelect>;
  } else if (spec.type === "object") {
    Component = ObjectField;
    isNest = true;
  } else if (spec.type === "string") {
    Component = StringField;
  } else if (spec.type === "array") {
    Component = ArrayField;
  } else if (spec.type === "boolean") {
    Component = BooleanField;
  } else if (spec.type === "integer" || spec.type === "number") {
    Component = NumberField;
  } else if (spec.type === "null") {
    Component = NullField;
  } else if ("anyOf" in spec || "oneOf" in spec) {
    Component = MultiSpecField;
    isNest = true;
  } else if (path) {
    console.info("Found unsupported spec", spec);
  }

  const FieldComponent = (
    <Component
      widgetOptions={widgetOptions}
      error={typeof error !== "string" ? error : undefined}
      field={field}
      spec={spec}
      value={value}
      path={path}
      subKey={subKey}
      level={level}
      onChange={onChange}
      step={step}
      stepElsRef={stepElsRef}
      layout={layout}
      slot={slot}
      helperSlot={helperSlot}
    />
  );
  const FieldComponentWithRenderer = (
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
      <DefaultTemplate
        label={label}
        layout={field?.layout}
        description={
          helperSlot?.(
            { path, ...(field || {}), index },
            field?.helperText || '',
            `helper_${path}`
          ) || field?.helperText
        }
        labelWidth={field?.labelWidth}
        displayLabel={displayLabel}
        displayDescription={displayDescription}
        spec={spec}
        error={typeof error === "string" ? error : ""}
      >
        {slot?.(
          { path, ...(field || {}), index },
          FieldComponent,
          `filed_${path}`
        ) || FieldComponent}
      </DefaultTemplate>
    </Col>
  );

  if (typeof step === "number" && stepElsRef[step] && layout?.steps?.[step]) {
    const { paths: inStepPaths } = layout?.steps?.[step];
    let notInStep = true;
    for (const p of inStepPaths) {
      if (p === path) {
        notInStep = false;
        break;
      }
      const [prefix, pattern] = p.split("/");
      if (!pattern) {
        continue;
      }
      if (pattern === "*" && path.startsWith(prefix)) {
        notInStep = false;
        break;
      }
    }
    if (notInStep && !isNest) {
      return null;
    }
    if (notInStep && isNest) {
      return FieldComponent;
    }
  }

  return FieldComponentWithRenderer;
};

export default SpecField;
