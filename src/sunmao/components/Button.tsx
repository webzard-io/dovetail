import { useContext, useEffect, useRef } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { buttonTypes, KitContext } from "../../themes/theme-context";
import { StringUnion } from "../helper";

const ButtonProps = Type.Object({
  type: StringUnion(buttonTypes),
});

const ButtonState = Type.Object({});

export const Button = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "button",
    displayName: "Button",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      type: "primary",
    },
    exampleSize: [2, 1],
    annotations: {
      category: "Input",
    },
  },
  spec: {
    properties: ButtonProps,
    state: ButtonState,
    methods: {
      click: undefined,
    },
    slots: ["content"],
    styleSlots: ["button"],
    events: ["onClick"],
  },
})(
  ({
    slotsElements,
    subscribeMethods,
    type,
    callbackMap,
    customStyle,
    elementRef,
  }) => {
    const kit = useContext(KitContext);
    const buttonRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (typeof elementRef === "object") {
        buttonRef.current = elementRef?.current;
      }

      subscribeMethods({
        click: () => {
          buttonRef.current?.click();
        },
      });
    }, []);

    return (
      <kit.Button
        type={type}
        ref={elementRef}
        onClick={callbackMap?.onClick}
        className={css`
          ${customStyle?.button}
        `}
      >
        {slotsElements.content || "text"}
      </kit.Button>
    );
  }
);
