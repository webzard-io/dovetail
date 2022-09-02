import React, { useContext, useState, useRef } from "react";
import { Modal as AntdModal } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { KitContext } from "../../../../kit-context";
import cs from "classnames";
import { isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { cx } from "@linaria/core";
import { Modal2Props } from "../../../../kit-context";

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

const Modal: React.FC<Modal2Props> = (props) => {
  const { t } = useTranslation();
  const kit = useContext(KitContext);

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
    size,
    showFooter,
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
      if (size === "medium") {
        setOfClassName.add("size-medium");
      }
    }

    return cs.apply(undefined, [...setOfClassName]);
  };

  const getWidth = () => {
    if (fullscreen) {
      return "calc(100vw - 16px)";
    } else if (width) {
      return width;
    } else {
      if (size === "medium") {
        return "720px";
      }
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
              <kit.Button
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
              </kit.Button>
            )}
            {showOk && (
              <kit.Button
                onClick={(e) => {
                  onOk?.(e);
                  transitionClass.current = fullscreen ? "" : "modal-send";
                }}
                type="primary"
                {...okButtonProps}
                loading={confirmLoading || okLoading}
              >
                {okText}
              </kit.Button>
            )}
          </div>
        </>
      );
    }

    return footer;
  };

  return (
    <AntdModal
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
        showFooter ? <div className="footer-content">{getFooter()}</div> : null
      }
    >
      {children}
    </AntdModal>
  );
};

export default Modal;
