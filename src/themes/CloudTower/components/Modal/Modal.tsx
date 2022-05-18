import React from "react";
import { Modal as AntdModal } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { cx } from "@linaria/core";

type ModalProps = {
  className?: string;
  width?: number;
  visible?: boolean;
  maskClosable?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  getContainer: string | (() => HTMLElement);
};

const Modal = React.forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    className,
    width = 480,
    visible,
    maskClosable,
    onClose,
    getContainer,
    children,
    title,
    footer = null,
  } = props;
  return (
    <AntdModal
      destroyOnClose
      title={title}
      className={cx(className, "normal-modal", "size-medium")}
      width={width}
      maskClosable={maskClosable}
      transitionName="modal-zoom"
      closeIcon={<CloseCircleFilled />}
      focusTriggerAfterClose={false}
      onCancel={() => {
        onClose?.();
      }}
      visible={visible}
      afterClose={() => {}}
      footer={footer}
      getContainer={getContainer}
    >
      <div ref={ref}>{children}</div>
    </AntdModal>
  );
});

export default Modal;
