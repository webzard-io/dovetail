import React from "react";
import { isEmpty } from "lodash-es";
// TODO: use kit context when I have time:)
import { Form, Row, Col } from "antd";
import { css, cx } from "@linaria/core";
import { JSONSchema7 } from "json-schema";
import { WidgetProps } from "./widget";
import UnsupportedField from "./_UnsupportedField";
import StringField from "./_StringField";
import ArrayField from "./_ArrayField";
import BooleanField from "./_BooleanField";
import NumberField from "./_NumberField";
import NullField from "./_NullField";
import ObjectField from "./_ObjectField";
import MultiSpecField from "./_MultiSpecField";

type TemplateProps = {
  id?: string;
  label?: string;
  errors?: React.ReactElement;
  description?: string;
  hidden?: boolean;
  required?: boolean;
  displayLabel?: boolean;
  displayDescription?: boolean;
  children?: React.ReactNode;
  level: number;
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
  } = props;

  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <Form.Item required={required} id={id}>
      <Row>
        {displayLabel && (
          <Col span="6" className={FormLabel}>
            {label}
          </Col>
        )}
        <Col span={displayLabel ? 18 : 24}>{children}</Col>
        {errors && <div className={FormErrorMessage}>{errors}</div>}
        {description && displayDescription && (
          <div className={FormHelperText}>{description}</div>
        )}
      </Row>
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
  const { spec, level, path, value, onChange } = props;
  const { title, widgetOptions } = spec;
  const label = title ?? "";
  const displayLabel =
    widgetOptions?.displayLabel !== false && shouldDisplayLabel(spec, label);
  const displayDescription = shouldDisplayDescdisplayDescription(spec);

  if (isEmpty(spec)) {
    return null;
  }

  let Component = UnsupportedField;

  // type fields
  if (spec.type === "object") {
    Component = ObjectField;
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
  } else {
    console.info("Found unsupported spec", spec);
  }

  return (
    <DefaultTemplate
      label={label}
      description={spec.description}
      displayLabel={displayLabel}
      displayDescription={displayDescription}
      level={level}
    >
      <Component
        spec={spec}
        value={value}
        path={path}
        level={level}
        onChange={onChange}
      />
    </DefaultTemplate>
  );
};

export default SpecField;
