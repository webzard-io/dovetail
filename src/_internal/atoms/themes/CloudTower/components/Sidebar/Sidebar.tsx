import React from "react";
import { cx } from "@linaria/core";
import { Sidebar as SidebarStyle } from "./Sidebar.style";
import { CloseCircleFilled } from "@ant-design/icons";
import { useUIKit } from "@cloudtower/eagle";

export type SidebarProps = {
  className?: string;
  width?: number;
  visible?: boolean;
  onClose?: () => void;
  getContainer: string | (() => HTMLElement);
  children?: React.ReactNode;
};

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(props, ref) {
  const kit = useUIKit();
  const { className, width, visible, onClose, children, getContainer } = props;
  return (
    <kit.antdDrawer
      className={cx(SidebarStyle, className)}
      visible={visible}
      width={width}
      onClose={onClose}
      mask={false}
      keyboard={true}
      closable={false}
      getContainer={getContainer}
    >
      <div className="drawer-content-inner" ref={ref}>
        {children}
        <CloseCircleFilled className="close-icon" onClick={onClose} />
      </div>
    </kit.antdDrawer>
  );
});

export default Sidebar;
