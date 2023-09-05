import React, { useRef } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import { useUIKit } from "@cloudtower/eagle";
import cs from "classnames";
import { isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { cx } from "@linaria/core";
import { ModalProps as AntdModalProps } from "antd/lib/modal";

export type ModalProps = AntdModalProps & {
  /** Set is fullscreen to display modal */
  fullscreen?: boolean;
  /** Set loading type for ok button */
  okLoading?: boolean;
  /** Set disabled type for ok button */
  okDisabled?: boolean;
  /** Set error in footer */
  footerError?: string | React.ReactNode | Error;
  children?: React.ReactNode;
  /** Display cancel button */
  showCancel?: boolean;
  /** Display ok button */
  showOk?: boolean;
  /** Set is a normal modal, width is 460px. If width is set it will fail */
  normal?: boolean;
};
interface ModalErrorType {
  error: Error | string | React.ReactNode;
}

interface ModalFooterErrorType extends ModalErrorType {
  className?: string;
}

export const ModalFooterError: React.FC<ModalFooterErrorType> = (props) => {
  const { error, className } = props;
  const { i18n } = useTranslation();

  if (React.isValidElement(error)) {
    return <span className="modal-error">{error}</span>;
  }

  if (!error) {
    return null;
  }
  return (
    <span title={String(error)} className={cx("modal-error", className)}>
      {error}
    </span>
  );
};

const Modal: React.FC<ModalProps> = (props) => {
  const { t } = useTranslation();
  const kit = useUIKit();

  const {
    className,
    visible,
    maskClosable = false,
    fullscreen,
    children,
    width,
    onCancel,
    onOk,
    afterClose,
    normal = true,
    footer,
    footerError,
    showCancel = true,
    showOk = true,
    cancelButtonProps,
    okButtonProps,
    confirmLoading,
    okLoading,
    okText = t("cluster.confirm"),
    cancelText = t("common.cancel"),
    ...modalPropsArgs
  } = props;
  /* Set transition className */
  const transitionClass = useRef<
    "modal-zoom" | "modal-send" | "fullscreen-modal" | ""
  >(fullscreen ? "fullscreen-modal" : "modal-zoom");

  const getClassName = () => {
    const setOfClassName = new Set<string>();

    if (className) {
      setOfClassName.add(className);
    }

    if (fullscreen) {
      setOfClassName.add("fullscreen");
    }

    if (!fullscreen && normal) {
      setOfClassName.add("normal-modal");
    }

    return cs.apply(undefined, [...setOfClassName]);
  };

  const getWidth = () => {
    if (fullscreen) {
      return "calc(100vw - 16px)";
    } else if (width) {
      return width;
    } else {
      return normal ? 460 : "";
    }
  };

  const getFooter = () => {
    if (isNil(footer)) {
      return (
        <>
          <div className="modal-footer-left">
            <ModalFooterError className="modal-error" error={footerError} />
          </div>
          <div className="modal-footer-btn-group">
            {showCancel && (
              <kit.button
                type="quiet"
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  onCancel?.(e);
                  transitionClass.current = fullscreen ? "" : "modal-zoom";
                }}
                className={cs(cancelButtonProps?.className)}
                {...cancelButtonProps}
                loading={false}
              >
                {cancelText}
              </kit.button>
            )}
            {showOk && (
              <kit.button
                onClick={(e) => {
                  onOk?.(e);
                  transitionClass.current = fullscreen ? "" : "modal-send";
                }}
                type="primary"
                {...okButtonProps}
                loading={confirmLoading || okLoading}
              >
                {okText}
              </kit.button>
            )}
          </div>
        </>
      );
    }

    return footer;
  };

  return (
    <kit.antdModal
      destroyOnClose
      className={getClassName()}
      width={getWidth()}
      maskClosable={maskClosable}
      transitionName={transitionClass.current}
      closeIcon={<CloseCircleFilled />}
      focusTriggerAfterClose={false}
      onCancel={(e) => {
        onCancel?.(e);
        transitionClass.current = fullscreen ? "" : "modal-zoom";
      }}
      {...modalPropsArgs}
      visible={visible}
      afterClose={() => {
        afterClose?.();
      }}
      footer={
        <div className="footer-content">{getFooter()}</div>
      }
    >
      {children}
    </kit.antdModal>
  );
};

export default Modal;
