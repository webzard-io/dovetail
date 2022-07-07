import React from "react";
import isEmpty from "lodash/isEmpty";
// TODO: use kit context when I have time:)
import { Row, Col } from "antd";
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

type TemplateProps = {
  id?: string;
  label?: string;
  errors?: React.ReactElement;
  description?: string;
  hidden?: boolean;
  required?: boolean;
  displayLabel?: boolean;
  displayDescription?: boolean;
  spec: WidgetProps["spec"];
  children?: React.ReactNode;
};

const FormLabel = css`
  padding-right: 12px;
  font-size: 13px;
  color: rgba(44, 56, 82, 0.6);
`;

const FormErrorMessage = css`
  font-size: 13px;
  line-height: 20px;
  color: #f0483e;
  margin-top: -4px;
  margin-bottom: 8px;
`;

const FormHelperText = css`
  font-size: 12px;
  color: rgba(44, 56, 82, 0.6);
`;

const FormItem = css`
  line-height: 32px;
`;

const HasMargin = css`
  margin-bottom: 16px;
`;

const FieldSection = css`
  font-weight: 700;
  color: #2d3a56;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(213, 219, 227, 0.6);
  margin-bottom: 16px;
  display: block;
  width: 100%;
`;

const DefaultTemplate: React.FC<TemplateProps> = (props) => {
  const {
    id,
    label,
    children,
    errors,
    description,
    hidden,
    required,
    displayLabel,
    displayDescription,
    spec,
  } = props;

  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <Row className={cx(FormItem, displayLabel && HasMargin)}>
      {spec.widgetOptions?.section && (
        <div className={FieldSection}>{spec.widgetOptions.section}</div>
      )}
      {displayLabel && (
        <Col span="6" className={FormLabel}>
          {label}
        </Col>
      )}
      <Col span={displayLabel ? 18 : 24}>
        {children}
        {errors && <div className={FormErrorMessage}>{errors}</div>}
        {description && displayDescription && (
          <div className={FormHelperText}>{description}</div>
        )}
      </Col>
    </Row>
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
    spec,
    level,
    path,
    step,
    value,
    onChange,
    renderer,
    stepElsRef,
    layout,
  } = props;
  const { title, widgetOptions } = spec;
  const label = title ?? "";
  const displayLabel =
    widgetOptions?.displayLabel !== false && shouldDisplayLabel(spec, label);
  const displayDescription = shouldDisplayDescdisplayDescription(spec);

  if (isEmpty(spec)) {
    return null;
  }

  let Component = UnsupportedField;
  let isNest = false;

  // type fields
  if (spec.type === "object") {
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
  } else {
    console.info("Found unsupported spec", spec);
  }

  const FieldComponent = (
    <Component
      spec={spec}
      value={value}
      path={path}
      level={level}
      onChange={onChange}
      renderer={renderer}
      step={step}
      stepElsRef={stepElsRef}
      layout={layout}
    />
  );
  const FieldComponentWithRenderer = (
    <>
      {renderer?.(path, level, "before")}
      <DefaultTemplate
        label={label}
        description={spec.description}
        displayLabel={displayLabel}
        displayDescription={displayDescription}
        spec={spec}
      >
        {renderer?.(path, level, "widget") || FieldComponent}
      </DefaultTemplate>
      {renderer?.(path, level, "after")}
    </>
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
