import * as antd from "antd";

declare module "antd/lib/modal" {
  export interface ModalProps {
    focusTriggerAfterClose?: boolean;
  }
}
