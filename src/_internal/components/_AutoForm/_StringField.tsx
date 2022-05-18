import React, { useState, useEffect } from "react";
import { WidgetProps } from "./widget";
import { Select, Input } from "antd";

const EnumField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange } = props;
  const options = (spec.enum || []).map((item) => item?.toString() || "");

  return (
    <Select value={value} onChange={(value) => onChange(value)}>
      {options.map((value, idx) => {
        return <Select.Option key={idx}>{value}</Select.Option>;
      })}
    </Select>
  );
};

export const StringField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange } = props;

  // enum
  if (Array.isArray(spec.enum)) {
    return <EnumField {...props} />;
  }

  return (
    <Input
      value={value}
      onChange={(evt) => onChange(evt.currentTarget.value)}
    />
  );
};

export default StringField;
