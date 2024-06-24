import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  DIALOG_CONTAINER_ID,
  implementRuntimeComponent,
  StringUnion,
  PRESET_PROPERTY_CATEGORY,
} from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../_internal/atoms/kit-context";

const ModalProps = Type.Object({
  width: Type.Number({
    title: "Width",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  fullscreen: Type.Boolean({
    title: "Fullscreen",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  size: StringUnion(["normal", "medium", "fullscreen"], {
    title: "Size",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  zIndex: Type.Number({
    title: "zIndex",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  confirmText: Type.String({
    title: "Confirm text",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  confirmLoading: Type.Boolean({
    title: "Confirm loading",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  defaultVisible: Type.Boolean({
    title: "Default visible",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  maskClosable: Type.Boolean({
    title: "Mask closable",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
  }),
  showFooter: Type.Boolean({
    title: "Show footer",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
  }),
  popupContainerId: Type.String(),
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
      zIndex: 1000,
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
    events: ["onOpen", "onClose", "onConfirm", "afterClose"],
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
    confirmLoading,
    confirmText,
    fullscreen,
    size,
    zIndex,
    mergeState,
    popupContainerId,
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
          mergeState({
            visible: true,
          });
        },
        close() {
          setVisible(false);
          mergeState({
            visible: false,
          });
        },
      });
    }, []);
    useEffect(() => {
      if (visible) {
        callbackMap?.onOpen?.();
      }
    }, [visible, callbackMap]);
    useEffect(() => {
      mergeState({
        visible,
      });
    }, [visible, mergeState]);
    const onClose = useCallback(() => {
      setVisible(false);
      mergeState({
        visible: false,
      });
      callbackMap?.onClose?.();
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
          document.getElementById(DIALOG_CONTAINER_ID) ||
          document.getElementById(popupContainerId) ||
          document.body
        }
        footer={
          showFooter ? slotsElements.footer?.({}, undefined) || undefined : null
        }
        confirmLoading={confirmLoading}
        okText={confirmText}
        fullscreen={fullscreen}
        size={size}
        showFooter={showFooter}
        onCancel={onClose}
        onOk={callbackMap?.onConfirm}
        afterClose={callbackMap?.afterClose}
        zIndex={zIndex || 1000}
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
