import React, { useState, useEffect } from "react";
import { WidgetProps } from "./widget";
import Input from "../Input";
import Select from "../Select";
import Textarea from "../Textarea";

const EnumField: React.FC<WidgetProps> = (props) => {
  const { spec, value, onChange } = props;
  const options = (spec.enum || []).map((item) => item?.toString() || "");

  return (
    <Select
      {...props}
      widgetOptions={{
        options: options.map((value) => ({
          value,
          label: value,
          tags: []
        })),
      }}
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
    return <Textarea {...props} />;
  }

  return <Input {...props} />;
};

export default StringField;
