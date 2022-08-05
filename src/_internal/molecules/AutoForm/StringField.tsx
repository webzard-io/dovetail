import React, { useState, useEffect } from "react";
import { WidgetProps } from "./widget";
import Input from "../Form/Input";
import Select from "../Form/Select";
import Textarea from "../Form/Textarea";

const EnumField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange } = props;
  const options = (spec.enum || []).map((item) => item?.toString() || "");

  return (
    <Select
      value={value}
      onChange={(value) => onChange(value)}
      options={options.map((value) => ({
        value,
        label: value,
      }))}
    />
  );
};

export const StringField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange, widget } = props;

  // enum
  if (Array.isArray(spec.enum)) {
    return <EnumField {...props} />;
  }

  if (widget === "textarea") {
    return <Textarea value={value} onChange={(value) => onChange(value)} />;
  }

  return (
    <Input
      value={value}
      onChange={(value) => {
        onChange(value);
      }}
    />
  );
};

export default StringField;
