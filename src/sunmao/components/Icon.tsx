import React from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { ExpandAltOutlined, NodeIndexOutlined } from "@ant-design/icons";

const IconProps = Type.Object({
  name: Type.String(),
});

const IconState = Type.Object({});

const iconMap: Record<string, React.ForwardRefExoticComponent<any>> = {
  ExpandAltOutlined,
  NodeIndexOutlined,
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
      className={css`
        ${customStyle}
      `}
    />
  );
});
