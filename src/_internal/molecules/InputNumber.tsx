import React from "react";
import { InputNumber as AntdInputNumber } from "antd";
import { Type, Static } from "@sinclair/typebox";

export const OptionsSpec = Type.Object({
  max: Type.Optional(Type.Number({ title: "Number" })),
  min: Type.Optional(Type.Number({ title: "Number" })),
});

type Props = {
  value?: number;
  onChange(value: string | number | undefined): void;
} & Static<typeof OptionsSpec>;

const InputNumber = (props: Props) => {
  return <AntdInputNumber {...props}></AntdInputNumber>;
};

export default InputNumber;
