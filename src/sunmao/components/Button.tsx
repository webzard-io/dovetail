import { useContext, useEffect, useRef } from "react";
import {
  implementRuntimeComponent,
  Text,
  TextPropertySpec,
} from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { buttonTypes, KitContext } from "../../themes/theme-context";
import { StringUnion } from "../helper";

const ButtonProps = Type.Object({
  type: StringUnion(buttonTypes),
  disabled: Type.Boolean(),
  text: TextPropertySpec,
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
      text: {
        raw: "text",
        format: "plain",
      },
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
    slots: {
      prefix: {
        slotProps: Type.Object({}),
      },
      content: {
        slotProps: Type.Object({}),
      },
    },
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
    disabled,
    text,
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
        disabled={disabled}
      >
        <>
          <span
            className={css`
              margin-right: 4px;
            `}
          >
            <>{slotsElements.prefix ? slotsElements.prefix({}) : null}</>
          </span>
          {slotsElements.content ? (
            slotsElements.content({})
          ) : (
            <Text value={text} />
          )}
        </>
      </kit.Button>
    );
  }
);
