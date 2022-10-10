import React, { useCallback, useState, useContext, useEffect } from "react";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";

export const OptionsSpec = Type.Object({
  max: Type.Optional(Type.Number({ title: "Max" })),
  min: Type.Optional(Type.Number({ title: "Min" })),
  prefix: Type.Optional(Type.String()),
  suffix: Type.Optional(Type.String()),
});

type Props = WidgetProps<number, Static<typeof OptionsSpec>>;

const InputNumber = (props: Props) => {
  const kit = useContext(KitContext);
  const [stringValue, setStringValue] = useState(props.value);

  const onChange = useCallback(
    (event, newValue) => {
      setStringValue(newValue);
    },
    [setStringValue]
  );
  const onBlur = useCallback(() => {
    const numValue = stringValue;

    if (numValue !== undefined) {
      props.onChange(
        numValue,
        `${
          props.subKey ? `${props.subKey}${props.field?.key ? "-" : ""}` : ""
        }${props.field?.key || ""}`
      );
    }
  }, [props.onChange, stringValue]);

  useEffect(() => {
    setStringValue(props.value);
  }, [props.value]);

  return (
    <kit.Input
      {...props.widgetOptions}
      type="int"
      value={stringValue}
      onChange={onChange}
      onBlur={onBlur}
    ></kit.Input>
  );
};

export default InputNumber;
