import React from "react";
import { Type, Static } from "@sinclair/typebox";
import { Switch as AntdSwitch } from "antd";

export const OptionsSpec = Type.Object({});

type Props = {
  value: boolean;
  onChange(value: boolean): void;
} & Static<typeof OptionsSpec>;

const Switch = (props: Props) => {
  return <AntdSwitch {...props} checked={props.value}></AntdSwitch>;
};

export default Switch;
