import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DIALOG_CONTAINER_ID,
  implementRuntimeComponent,
  StringUnion,
} from "@sunmao-ui/runtime";
import { css as ecss } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../_internal/atoms/kit-context";
import { useTranslation } from "react-i18next";
import { styled } from "@linaria/react";
import { cx } from "@linaria/core";
import Icon from "../../_internal/atoms/themes/CloudTower/components/Icon/Icon";
import { Typo } from "../../_internal/atoms/themes/CloudTower/styles/typo.style";

const FooterWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;
const FooterError = styled.div`
  display: flex;
  align-items: flex-start;
  margin-right: 12px;
  font-size: 13px;
  color: $red-60;
  text-align: left;

  .modal-error-icon {
    margin-right: 6px;
    margin-top: 3px;
    flex-shrink: 0;
  }

  .modal-error-text {
    overflow: hidden;
    font-size: 14px;
    line-height: 22px;
  }
`;

const FooterButtonWrapper = styled.div`
  flex-shrink: 0;
`;

const ModalProps = Type.Object({
  title: Type.String(),
  width: Type.Number(),
  defaultVisible: Type.Boolean(),
  maskClosable: Type.Boolean(),
  showFooter: Type.Boolean(),
  footerError: Type.String(),
  size: StringUnion(["small", "medium"]),
  isChildModal: Type.Boolean(),
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
    footerError,
    size,
    isChildModal,
    mergeState,
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
          mergeState({
            visible: true,
          });
          callbackMap?.onOpen?.();
        },
        close() {
          setVisible(false);
          mergeState({
            visible: false,
          });
        },
      });
    }, []);
    const onClose = useCallback(() => {
      setVisible(false);
      mergeState({
        visible: false,
      });
      callbackMap?.onClose?.();
    }, [callbackMap?.onClose]);

    return (
      <kit.Modal
        ref={elementRef}
        onClose={onClose}
        afterClose={callbackMap?.afterClose}
        className={ecss`
          ${customStyle?.modal}
        `}
        visible={visible}
        maskClosable={maskClosable}
        maskStyle={{
          background: isChildModal ? 'rgba(16, 26, 41, 0.6)' : undefined
        }}
        width={width}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        title={title}
        size={size}
        footer={
          showFooter ? (
            <FooterWrapper>
              {footerError ? (
                <FooterError>
                  <Icon
                    className="modal-error-icon"
                    type="1-exclamation-error-circle-fill-16-red"
                  ></Icon>
                  <span
                    className={cx("modal-error-text", Typo.Label.l4_regular)}
                  >
                    {footerError}
                  </span>
                </FooterError>
              ) : (
                <span />
              )}
              <FooterButtonWrapper>
                {slotsElements.footer ? (
                  slotsElements.footer({})
                ) : (
                  <kit.Button type="text" onClick={onClose}>
                    {t("dovetail.cancel")}
                  </kit.Button>
                )}
              </FooterButtonWrapper>
            </FooterWrapper>
          ) : null
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
