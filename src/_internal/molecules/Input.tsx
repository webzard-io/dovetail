import React, { useCallback } from "react";
import { Input as AntdInput } from "antd";
import { Type, Static } from "@sinclair/typebox";

export const OptionsSpec = Type.Object({
  addonBefore: Type.Optional(Type.String()),
  addonAfter: Type.Optional(Type.String()),
});

type Props = {
  value: string;
  onChange(value: string): void;
} & Static<typeof OptionsSpec>;

const Input = (props: Props) => {
  const onChange = useCallback(
    (e) => {
      props.onChange(e.target.value);
    },
    [props.onChange]
  );

  return <AntdInput {...props} onChange={onChange}></AntdInput>;
};

export default Input;
