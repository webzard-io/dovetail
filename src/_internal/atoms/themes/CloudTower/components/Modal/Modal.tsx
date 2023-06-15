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
  afterClose?: ()=> void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  getContainer: string | (() => HTMLElement);
  size?: 'small' | 'medium';
  maskStyle?: React.CSSProperties;
};

const Modal = React.forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    className,
    width = 480,
    visible,
    maskClosable,
    onClose,
    afterClose,
    getContainer,
    children,
    title,
    size = 'medium',
    footer = null,
    maskStyle,
  } = props;
  return (
    <AntdModal
      destroyOnClose
      title={title}
      className={cx(className, "normal-modal", `size-${size}`)}
      width={width}
      maskClosable={maskClosable}
      transitionName="modal-zoom"
      closeIcon={<CloseCircleFilled />}
      focusTriggerAfterClose={false}
      onCancel={() => {
        onClose?.();
      }}
      maskStyle={maskStyle}
      visible={visible}
      afterClose={afterClose}
      footer={footer}
      getContainer={getContainer}
    >
      <div ref={ref}>{children}</div>
    </AntdModal>
  );
});

export default Modal;
