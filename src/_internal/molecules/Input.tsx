import React, { useCallback } from "react";
import { Input as AntdInput } from "antd";
import { StringUnion } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({
  addonBefore: Type.Optional(Type.String()),
  addonAfter: Type.Optional(Type.String()),
  type: Type.Optional(StringUnion(["password"])),
});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const Input = (props: Props) => {
  const onChange = useCallback(
    (e) => {
      props.onChange(
        e.target.value,
        `${props.subKey ? `${props.subKey}${props.field?.key ? '-' : ''}` : ""}${props.field?.key || ""}`
      );
    },
    [props.onChange, props.subKey, props.field]
  );

  return (
    <AntdInput
      {...props.widgetOptions}
      value={props.value}
      onChange={onChange}
    ></AntdInput>
  );
};

export default Input;
