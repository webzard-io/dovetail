import React, { useState } from "react";
import { Button as AntdButton } from "antd";
import { ButtonProps as AntdButtonProps, ButtonType } from "antd/lib/button";
import { Typo } from "../../styles/typo.style";
import { cx } from "@linaria/core";
import { ButtonStyle, NoPadding } from "./Button.style";
import Icon from '../Icon/Icon';

const isAntdButtonTypes = (type?: string): type is ButtonType => {
  return Boolean(
    type &&
      ["default", "primary", "ghost", "dashed", "link", "text"].includes(type)
  );
};

type ButtonProps = {
  prefixIcon?: string;
  hoverPrefixIcon?: string;
  suffixIcon?: string;
  hoverSuffixIcon?: string;
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
          type && `dovetail-ant-btn-${type}`,
          !children &&
            children !== 0 &&
            restProps.icon &&
            "dovetail-ant-btn-icon-only"
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
        {prefixIcon && (
          <Icon
            type={
              status === "hover" && hoverPrefixIcon
                ? hoverPrefixIcon
                : prefixIcon
            }
            className="button-prefix-icon"
          />
        )}
        {children}
        {suffixIcon && (
          <Icon
            type={
              status === "hover" && hoverSuffixIcon
                ? hoverSuffixIcon
                : suffixIcon
            }
            className="button-suffix-icon"
          />
        )}
      </AntdButton>
    );
  }
);

export default Button;
