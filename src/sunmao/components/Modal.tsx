import { useContext, useEffect, useRef } from "react";
import {
  DIALOG_CONTAINER_ID,
  implementRuntimeComponent,
} from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../_internal/atoms/kit-context";

const ModalProps = Type.Object({
  title: Type.String(),
  width: Type.Number(),
  visible: Type.Boolean(),
  maskClosable: Type.Boolean(),
});

const ModalState = Type.Object({
  visible: Type.Boolean(),
});

export const Modal = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "modal",
    displayName: "Modal",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      title: "Header",
    },
    exampleSize: [4, 8],
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: ModalProps,
    state: ModalState,
    methods: {},
    slots: {
      content: {
        slotProps: Type.Object({}),
      },
      footer: {
        slotProps: Type.Object({}),
      },
    },
    styleSlots: ["modal"],
    events: ["onClose"],
  },
})(
  ({
    slotsElements,
    subscribeMethods,
    callbackMap,
    customStyle,
    elementRef,
    visible,
    maskClosable,
    width,
    title,
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
      <kit.Modal
        ref={elementRef}
        onClose={callbackMap?.onClose}
        className={css`
          ${customStyle?.modal}
        `}
        visible={visible}
        maskClosable={maskClosable}
        width={width}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        title={title}
        footer={
          <>
            {slotsElements.footer ? (
              slotsElements.footer({})
            ) : (
              <kit.Button type="text" onClick={callbackMap?.onClose}>
                取消
              </kit.Button>
            )}
          </>
        }
      >
        <>
          {slotsElements.content
            ? slotsElements.content({})
            : "put content into modal"}
        </>
      </kit.Modal>
    );
  }
);
