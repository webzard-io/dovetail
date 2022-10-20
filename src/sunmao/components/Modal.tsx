import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  DIALOG_CONTAINER_ID,
  implementRuntimeComponent,
  StringUnion
} from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../_internal/atoms/kit-context";
import { useTranslation } from "react-i18next";

const ModalProps = Type.Object({
  title: Type.String(),
  width: Type.Number(),
  defaultVisible: Type.Boolean(),
  maskClosable: Type.Boolean(),
  showFooter: Type.Boolean(),
  size: StringUnion(['small', 'medium'])
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
    events: ["onOpen", "onClose", "afterClose"],
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
    title,
    showFooter,
    size,
  }) => {
    const kit = useContext(KitContext);
    const { t } = useTranslation();
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
    useEffect(() => {
      if (visible) {
        callbackMap?.onOpen?.();
      }
    }, [visible, callbackMap]);

    return (
      <kit.Modal
        ref={elementRef}
        onClose={onClose}
        afterClose={callbackMap?.afterClose}
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
        size={size}
        footer={
          <>
            {showFooter ? (
              slotsElements.footer ? (
                slotsElements.footer({})
              ) : (
                <kit.Button type="text" onClick={onClose}>
                  {t("dovetail.cancel")}
                </kit.Button>
              )
            ) : null}
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
