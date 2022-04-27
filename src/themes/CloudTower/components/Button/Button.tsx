import React, { useState } from "react";
import { Button as AntdButton } from "antd";
import { ButtonProps as AntdButtonProps, ButtonType } from "antd/lib/button";
import { Typo } from "../../styles/typo.style";
import { cx } from "@linaria/core";
import { ButtonStyle, NoPadding } from "./Button.style";

const isAntdButtonTypes = (type?: string): type is ButtonType => {
  return Boolean(
    type &&
      ["default", "primary", "ghost", "dashed", "link", "text"].includes(type)
  );
};

type ButtonProps = {
  prefixIcon?: React.ReactNode;
  hoverPrefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  hoverSuffixIcon?: React.ReactNode;
  type?:
    | ButtonType
    | "secondary"
    | "tertiary"
    | "ordinary"
    | "ordinary-onTint"
    | "quiet";
} & Omit<AntdButtonProps, "type">;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      type,
      className,
      children,
      prefixIcon,
      hoverPrefixIcon,
      suffixIcon,
      hoverSuffixIcon,
      onMouseEnter,
      onMouseLeave,
      size = "middle",
      ...restProps
    } = props;
    const [status, setStatus] = useState<"normal" | "hover">("normal");
    const hasIcon = prefixIcon || suffixIcon;
    const hasHoverIcon = hoverPrefixIcon || hoverSuffixIcon;
    return (
      <AntdButton
        ref={ref}
        className={cx(
          className,
          ButtonStyle,
          type === "link" && NoPadding,
          (prefixIcon || suffixIcon) && "has-icon",
          size === "large" && Typo.Label.l1_regular_title,
          size === "middle" && Typo.Label.l2_regular_title,
          size === "small" && Typo.Label.l3_regular_title,
          type && `ant-btn-${type}`,
          !children && children !== 0 && restProps.icon && "ant-btn-icon-only"
        )}
        type={isAntdButtonTypes(type) ? type : undefined}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          if (hasIcon && hasHoverIcon) {
            setStatus("hover");
          }
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          if (hasIcon && hasHoverIcon) {
            setStatus("normal");
          }
        }}
        size={size}
        {...restProps}
      >
        {status === "hover" ? hoverPrefixIcon : prefixIcon}
        {children}
        {status === "hover" ? hoverSuffixIcon : suffixIcon}
      </AntdButton>
    );
  }
);

export default Button;
