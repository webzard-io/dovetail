import React from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css as ecss } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import {
  ExpandAltOutlined,
  NodeIndexOutlined,
  ProfileOutlined,
  UnorderedListOutlined,
  RocketOutlined,
  BarChartOutlined,
  AlertOutlined,
} from "@ant-design/icons";

const IconProps = Type.Object({
  name: Type.String(),
});

const IconState = Type.Object({});

const iconMap: Record<string, React.ForwardRefExoticComponent<any>> = {
  ExpandAltOutlined,
  NodeIndexOutlined,
  ProfileOutlined,
  UnorderedListOutlined,
  RocketOutlined,
  BarChartOutlined,
  AlertOutlined,
};

export const Icon = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "icon",
    displayName: "Icon",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      name: "ExpandAltOutlined",
    },
    exampleSize: [1, 1],
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: IconProps,
    state: IconState,
    methods: {},
    slots: {},
    styleSlots: ["icon"],
    events: [],
  },
})(({ name, elementRef, customStyle }) => {
  const C = iconMap[name];
  return (
    <C
      ref={elementRef}
      className={ecss`
        ${customStyle}
      `}
    />
  );
});
