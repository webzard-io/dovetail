import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  DIALOG_CONTAINER_ID,
  implementRuntimeComponent,
  StringUnion,
} from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../_internal/atoms/kit-context";

const ModalProps = Type.Object({
  width: Type.Number(),
  fullscreen: Type.Boolean(),
  size: StringUnion(["normal", "medium", "fullscreen"]),
  defaultVisible: Type.Boolean(),
  maskClosable: Type.Boolean(),
  showFooter: Type.Boolean(),
});

const ModalState = Type.Object({
  visible: Type.Boolean(),
});

export const Modal = implementRuntimeComponent({
  version: "kui/v2",
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
    methods: {
      open: Type.Null(),
      close: Type.Null(),
    },
    slots: {
      content: {
        slotProps: Type.Object({}),
      },
      footer: {
        slotProps: Type.Object({}),
      },
    },
    styleSlots: ["modal"],
    events: ["onClose", "onConfirm"],
  },
})(
  ({
    slotsElements,
    subscribeMethods,
    callbackMap,
    customStyle,
    elementRef,
    defaultVisible,
    maskClosable,
    width,
    showFooter,
    fullscreen,
    size,
  }) => {
    const kit = useContext(KitContext);
    const [visible, setVisible] = useState(defaultVisible || false);
    const buttonRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (typeof elementRef === "object") {
        buttonRef.current = elementRef?.current;
      }

      subscribeMethods({
        open() {
          setVisible(true);
        },
        close() {
          setVisible(false);
        },
      });
    }, []);
    const onClose = useCallback(() => {
      setVisible(false);
      callbackMap?.onClose();
    }, [callbackMap?.onClose]);

    return (
      <kit.FullscreenModal
        className={css`
          ${customStyle?.modal}
        `}
        visible={visible}
        maskClosable={maskClosable}
        width={width}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        footer={showFooter ? undefined : null}
        fullscreen={fullscreen}
        size={size}
        showFooter={showFooter}
        onCancel={onClose}
        onOk={callbackMap?.onConfirm}
      >
        <>
          {slotsElements.content
            ? slotsElements.content({})
            : "put content into modal"}
        </>
      </kit.FullscreenModal>
    );
  }
);
