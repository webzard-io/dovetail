import React, { useCallback, useState } from "react";
import { Input as AntdInput } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({
  max: Type.Optional(Type.Number({ title: "Max" })),
  min: Type.Optional(Type.Number({ title: "Min" })),
  prefix: Type.Optional(Type.String()),
  suffix: Type.Optional(Type.String()),
});

type Props = WidgetProps<number, Static<typeof OptionsSpec>>;

const InputNumber = (props: Props) => {
  const [stringValue, setStringValue] = useState(props.value);
  const onChange = useCallback((event) => {
    const newValue = event.target.value;

    setStringValue(newValue);
  }, [setStringValue]);
  const onBlur = useCallback(() => {
    const numValue = Number(stringValue);

    if (numValue !== undefined) {
      props.onChange(
        numValue,
        `${props.subKey ? `${props.subKey}${props.field?.key ? '-' : ''}` : ""}${props.field?.key || ""}`
      );
    }
  }, [props.onChange]);

  return (
    <AntdInput
      {...props.widgetOptions}
      type="number"
      value={stringValue}
      onChange={onChange}
      onBlur={onBlur}
    ></AntdInput>
  );
};

export default InputNumber;
