import React from "react";
import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";
import { Switch as AntdSwitch } from "antd";
import { SwitchProps as AntdSwitchProps } from "antd/lib/switch";

export type SwitchProps = Omit<AntdSwitchProps, "size"> & {
  size?: "small" | "default" | "large";
};

const SwitchStyle = css`
  &.dovetail-ant-switch {
    min-width: 40px;
    height: 24px;
    background: $fills-trans-quinary-light;
    overflow: hidden;
    &:focus {
      box-shadow: 0 0 0 2px $strokes-light-trans-1;
    }
  }
  &.dovetail-ant-switch-small {
    min-width: 26px;
    height: 16px;
  }
  &.dovetail-ant-switch-large {
    min-width: 52px;
    height: 32px;
  }

  &.dovetail-ant-switch .dovetail-ant-switch-handle {
    height: 20px;
    width: 20px;
    &::before {
      border-radius: 10px;
      transition-delay: 120ms;
    }
  }
  &.dovetail-ant-switch-small .dovetail-ant-switch-handle {
    height: 14px;
    width: 14px;
    top: 1px;
    left: 1px;
  }
  &.dovetail-ant-switch-large .dovetail-ant-switch-handle {
    height: 28px;
    width: 28px;
    &::before {
      border-radius: 14px;
    }
  }

  &.dovetail-ant-switch-checked {
    background-color: $green-60;
  }
  &.dovetail-ant-switch-checked .dovetail-ant-switch-handle {
    left: calc(100% - 20px - 2px);
  }
  &.dovetail-ant-switch-small.dovetail-ant-switch-checked .dovetail-ant-switch-handle {
    left: calc(100% - 14px - 1px);
  }
  &.dovetail-ant-switch-large.dovetail-ant-switch-checked .dovetail-ant-switch-handle {
    left: calc(100% - 28px - 2px);
  }
`;

const Switch: React.FC<SwitchProps> = ({
  children,
  className,
  checked,
  ...props
}) => {
  const Content = styled.span`
    margin-left: 5px;
  `;

  const classNames = [className, SwitchStyle, "switch"];
  if (props.size === "large") classNames.push("ant-switch-large");

  return (
    <>
      <AntdSwitch
        className={cx(...classNames)}
        checked={checked || false}
        {...props}
        size={props.size as AntdSwitchProps["size"]}
      />
      {children ? <Content>{children}</Content> : null}
    </>
  );
};

export default Switch;
