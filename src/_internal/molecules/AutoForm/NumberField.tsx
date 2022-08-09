import React from "react";
import { WidgetProps } from "./widget";
import InputNumber from "../InputNumber";

export const NumberField: React.FC<WidgetProps> = (props) => {
  const { value, onChange } = props;

  return <InputNumber value={value} onChange={onChange}></InputNumber>;
};

export default NumberField;
