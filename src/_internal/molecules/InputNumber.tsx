import React, { useCallback } from "react";
import { InputNumber as AntdInputNumber } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({
  max: Type.Optional(Type.Number({ title: "Max" })),
  min: Type.Optional(Type.Number({ title: "Min" })),
});

type Props = WidgetProps<number, Static<typeof OptionsSpec>>;

const InputNumber = (props: Props) => {
  const onChange = useCallback(
    (newValue) => {
      if (newValue !== undefined) {
        props.onChange(Number(newValue), props.field?.key);
      }
    },
    [props.onChange]
  );

  return (
    <AntdInputNumber
      {...props.widgetOptions}
      value={props.value}
      onChange={onChange}
    ></AntdInputNumber>
  );
};

export default InputNumber;
