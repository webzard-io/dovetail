import React from "react";
import { WidgetProps } from "./widget";
import InputNumber from "../InputNumber";

export const NumberField: React.FC<WidgetProps> = (props) => {
  return <InputNumber {...props}></InputNumber>;
};

export default NumberField;
