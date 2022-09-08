import React from "react";
import { Type, Static } from "@sinclair/typebox";
import { Switch as AntdSwitch } from "antd";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({});

type Props = WidgetProps<boolean, Static<typeof OptionsSpec>>;

const Switch = (props: Props) => {
  return (
    <AntdSwitch
      checked={props.value}
      onChange={(value) =>
        props.onChange(
          value,
          `${props.subKey ? `${props.subKey}${props.field?.key ? '-' : ''}` : ""}${props.field?.key || ""}`
        )
      }
    ></AntdSwitch>
  );
};

export default Switch;
