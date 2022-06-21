import React, { useCallback } from "react";
import { WidgetProps } from "./widget";
import { Switch } from "antd";

export const BooleanField: React.FC<WidgetProps> = (props) => {
  const { value, onChange } = props;
  const onValueChange = useCallback(
    (checked: boolean) => {
      onChange(checked);
    },
    [onChange]
  );

  return <Switch checked={value} onChange={onValueChange} />;
};

export default BooleanField;
