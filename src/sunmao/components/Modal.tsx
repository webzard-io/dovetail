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
import { css as ecss, cx as ecx } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { kitContext } from "@cloudtower/eagle";
import { useTranslation } from "react-i18next";
import { styled } from "@linaria/react";
import { cx } from "@linaria/core";
import Icon from "../../_internal/atoms/themes/CloudTower/components/Icon/Icon";
import { Typo } from "../../_internal/atoms/themes/CloudTower/styles/typo.style";
import BaseModal from "src/_internal/atoms/themes/CloudTower/components/FullscreenModal/Modal";

export const CommonModalStyle = ecss`
&.ant-modal {
  .ant-modal-header {
    padding: 24px 56px 20px 24px;
    border-bottom: none;
  }

  .ant-modal-title {
    font-size: 20px;
    line-height: 24px;
    font-weight: 600;
  }

  .ant-modal-body {
    overflow-y: auto;
    max-height: calc(60vh - #{$footer-height});
    min-height: 88px;
    padding: 12px 24px 24px;
  }

  .ant-modal-footer {
    padding: 16px 24px;
    border-top: none;
    box-shadow: inset 0px 1px 0px rgba(235, 239, 245, 0.6);
  }
}

&.ant-modal.size-small {
  //top: 40px;
  min-height: 356px;

  .ant-modal-content {
    border-radius: 16px;

    .ant-modal-close-x {
      right: 40px;
    }
  }

  .ant-modal-header {
    border-radius: 16px 16px 0 0;
    padding: 40px 40px 8px;
    border-bottom: none;
  }

  .ant-modal-title {
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
  }

  .ant-modal-body {
    overflow-y: auto;
    padding: 24px 40px 32px;
    max-height: calc(100vh - 80px - 80px - 96px);
  }

  .ant-modal-footer {
    padding: 32px 40px;
    border-top: none;
    box-shadow: inset 0px 1px 0px rgba(235, 239, 245, 0.6);
  }
}

&.ant-modal.size-medium {
  //top: 40px;
  min-height: 356px;

  .ant-modal-content {
    border-radius: 16px;
  }

  .ant-modal-header {
    border-radius: 16px 16px 0 0;
    padding: 40px 60px 8px;
    border-bottom: none;
  }

  .ant-modal-title {
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
  }

  .ant-modal-body {
    overflow-y: auto;
    padding: 24px 60px 32px;
    max-height: calc(100vh - 80px - 80px - 96px);
  }

  .ant-modal-footer {
    padding: 32px 60px;
    border-top: none;
    box-shadow: inset 0px 1px 0px rgba(235, 239, 245, 0.6);
  }
}
`;

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
    exampleProperties: {
      title: "Header",
      size: "small"
    },
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
    const kit = useContext(kitContext);
    const { t } = useTranslation();
    const [visible, setVisible] = useState(defaultVisible || false);
    useEffect(() => {
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
    }, [callbackMap?.onClose, mergeState]);

    return (
      <BaseModal
        onCancel={onClose}
        afterClose={callbackMap?.afterClose}
        className={ecx(
          CommonModalStyle,
          `size-${size}`,
          ecss`
          ${customStyle?.modal}
        `
        )}
        visible={visible}
        maskClosable={maskClosable}
        maskStyle={{
          background: isChildModal ? "rgba(16, 26, 41, 0.6)" : undefined
        }}
        width={width}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        title={title}
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
                  <kit.button type="text" onClick={onClose}>
                    {t("dovetail.cancel")}
                  </kit.button>
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
      </BaseModal>
    );
  }
);
