import React, { useState, useEffect } from "react";
import { WidgetProps } from "./widget";
import { Select, Input } from "antd";

const EnumField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange } = props;
  const options = (spec.enum || []).map((item) => item?.toString() || "");

  return (
    <Select
      value={value}
      onChange={(value) => onChange(value)}
      showSearch
      optionFilterProp="children"
    >
      {options.map((value, idx) => {
        return (
          <Select.Option key={idx} value={value}>
            {value}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export const StringField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange, widget } = props;

  // enum
  if (Array.isArray(spec.enum)) {
    return <EnumField {...props} />;
  }

  if (widget === "textarea") {
    return (
      <Input.TextArea
        value={value}
        onChange={(evt) => onChange(evt.currentTarget.value)}
      />
    );
  }

  return (
    <Input
      value={value}
      onChange={(evt) => onChange(evt.currentTarget.value)}
    />
  );
};

export default StringField;
