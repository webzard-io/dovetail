import React, { useCallback } from "react";
import { WidgetProps } from "./widget";
import Switch from "../Switch";

export const BooleanField: React.FC<WidgetProps> = (props) => {
  return <Switch {...props} />;
};

export default BooleanField;
