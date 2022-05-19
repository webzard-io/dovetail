import React from "react";
import { implementWidget, WidgetProps } from "@sunmao-ui/editor-sdk";

type Props = WidgetProps;

export const AutoFormSpecWidget: React.FC<Props> = (props) => {
  const { value, services } = props;
  return null;
};

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "AutoFormSpecWidget",
  },
})(AutoFormSpecWidget);
