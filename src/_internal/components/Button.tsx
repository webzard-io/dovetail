import React, { useState } from "react";
import { Button as AntdButton } from "antd";
import { ButtonProps as AntdButtonProps, ButtonType } from "antd/lib/button";
import { Typo } from "../styles/typo.css";
import { ButtonType as AntdButtonType } from "antd/lib/button";
import { css, cx } from "@linaria/core";

const isAntdButtonTypes = (type?: string): type is AntdButtonType => {
  return Boolean(
    type &&
      ["default", "primary", "ghost", "dashed", "link", "text"].includes(type)
  );
};

const ButtonStyle = css`
  &.ant-btn {
    height: 32px;
    border-radius: 6px;
    line-height: 22px;
    transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
    transform: scale(var(--scale)) translateY(var(--transY)) translateZ(0);

    &.ant-btn-lg {
      height: 40px;
      line-height: 24px;
    }

    &.ant-btn-sm {
      height: 24px;
      line-height: 20px;
    }

    &.ant-btn-circle,
    &.ant-btn-circle-outline {
      border-radius: 50%;
    }
  }

  &.ant-btn.ant-btn-primary,
  &.ant-btn.ant-btn-secondary,
  &.ant-btn.ant-btn-tertiary,
  &.ant-btn.ant-btn-ordinary,
  &.ant-btn.ant-btn-ordinary-onTint,
  &.ant-btn.ant-btn-quiet {
    color: var(--color, #06101f);
    font-weight: var(--font-weight);
    background: var(--background-color, #fff);
    border-width: var(--border-width, 1px);
    border-color: var(--border-color, #d9d9d9);

    &[ant-click-animating-without-extra-node="true"]:after {
      display: none;
    }

    .anticon {
      color: var(--color, inherit);
    }

    &:hover,
    &.__pseudo-states-hover {
      background: var(--background-color-hover, var(--background-color));
      border-color: var(--border-color-hover, var(--border-color, transparent));
    }

    &:active,
    &.__pseudo-states-active {
      --scale: 1;
      --transY: 1px;
      background: var(--background-color-active, var(--background-color));
      border-color: var(
        --border-color-active,
        var(--border-color, transparent)
      );
    }

    &:focus,
    &.__pseudo-states-focus {
      background: var(--background-color-focus, var(--background-color));
      box-shadow: 0 0 0px 4px var(--box-shadow-color-focus);
      border-color: var(--border-color-focus, var(--border-color, transparent));
    }

    &[disabled],
    &[disabled]:hover,
    &[disabled]:focus,
    &[disabled]:active {
      color: var(--color-disabled, var(--color));
      background: var(--background-color-disabled, var(--background-color));
      border-color: var(
        --border-color-disabled,
        var(--border-color, transparent)
      );
      opacity: 0.5;
    }
  }

  &.ant-btn-link {
    &[disabled] {
      color: $text-light-general;
      opacity: 0.5;
    }
  }

  &.ant-btn-primary {
    --color: #{$white};
    --font-weight: bold;
    --border-width: 0;

    --background-color: #{$fills-light-general-general};
    --background-color-hover: #{$fills-light-general-general-bright};
    --background-color-active: #{$fills-light-general-general-dark};
    --background-color-focus: #{$fills-light-general-general};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};
  }

  &.ant-btn-primary.ant-btn-dangerous {
    --background-color: #{$fills-light-serious-serious};
    --background-color-hover: #{$fills-light-serious-serious-bright};
    --background-color-active: #{$fills-light-serious-serious-dark};
    --background-color-focus: #{$fills-light-serious-serious-bright};
    --box-shadow-color-focus: #{$strokes-light-serious-light};
  }

  &.ant-btn-primary.btn-primary-orange {
    --background-color: #{$fills-light-notice-notice};
    --background-color-hover: #{$fills-light-notice-notice-bright};
    --background-color-active: #{$fills-light-notice-notice-dark};
    --background-color-focus: #{$fills-light-notice-notice};
  }

  &.ant-btn-secondary {
    --color: #{$text-light-general};
    --font-weight: bold;
    --border-width: 0;

    --background-color: #{$fills-light-general-general-light};
    --background-color-hover: #{$fills-interaction-light-outstanding-hover};
    --background-color-active: #{$fills-interaction-light-outstanding-active};
    --background-color-focus: #{$fills-light-general-general-light};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};
  }

  &.ant-btn-secondary.ant-btn-dangerous {
    --color: #{$text-light-serious};

    --background-color: #{$fills-light-serious-serious-light};
    --background-color-hover: #{$fills-interaction-light-serious-hover};
    --background-color-active: #{$fills-interaction-light-serious-active};
    --background-color-focus: #{$fills-light-serious-serious-light};
    --box-shadow-color-focus: #{$fills-interaction-light-serious-hover};
  }

  &.ant-btn-secondary.btn-primary-orange {
    --color: #{$text-light-notice};
    --background-color: #{$fills-light-notice-notice-light};
    --background-color-hover: #{$fills-interaction-light-notice-hover};
    --background-color-active: #{$fills-interaction-light-notice-active};
    --background-color-focus: #{$fills-light-notice-notice-light};
  }

  &.ant-btn-tertiary {
    --color: #{$text-light-general};
    --font-weight: bold;
    --border-width: 0;

    --background-color: #{$white};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};

    box-shadow: none;

    &:not([disabled]),
    &:not(:focus) {
      &:hover,
      &:active,
      &.__pseudo-states-hover,
      &.__pseudo-states-active {
        filter: drop-shadow(0px 2px 8px rgba(0, 136, 255, 0.1));
      }
    }
  }

  &.ant-btn-tertiary.ant-btn-dangerous {
    --color: #{$text-light-serious};

    --background-color: #{$white};
    --box-shadow-color-focus: #{$fills-interaction-light-serious-hover};

    &:not([disabled]),
    &:not(:focus) {
      &:hover,
      &:active,
      &.__pseudo-states-hover,
      &.__pseudo-states-active {
        filter: drop-shadow(0px 2px 8px rgba(255, 74, 74, 0.1));
      }
    }
  }

  &.ant-btn-tertiary.btn-primary-orange {
    --color: #{$text-light-notice};
    --background-color: #{$white};

    &:not([disabled]),
    &:not(:focus) {
      &:hover,
      &:active,
      &.__pseudo-states-hover,
      &.__pseudo-states-active {
        filter: drop-shadow(0px 2px 8px rgba(255, 187, 0, 0.1));
      }
    }
  }

  &.ant-btn-ordinary {
    --color: #{$text-light-super};
    --border-color: #{$strokes-light-opaque-3};

    --background-color: #{$white};
    --background-color-hover: #{$fills-light-opaque-2};
    --background-color-active: #{$fills-light-opaque-3};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};

    box-shadow: 0px 1px 2px -1px rgba(44, 56, 82, 0.18);

    &:focus,
    &.__pseudo-states-focus {
      box-shadow: 0 0 0px 4px var(--box-shadow-color-focus);
    }
  }

  &.ant-btn-ordinary.ordinary-blue {
    --color: #{$text-light-general};
    --border-color: #{$fills-light-general-general};

    --background-color: #{$white};
    --background-color-hover: linear-gradient(
        0deg,
        rgba(0, 136, 255, 0.16),
        rgba(0, 136, 255, 0.16)
      ),
      #ffffff;
    --background-color-active: linear-gradient(
        0deg,
        rgba(0, 136, 255, 0.2),
        rgba(0, 136, 255, 0.2)
      ),
      #ffffff;
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};

    box-shadow: 0px 1px 2px -1px rgba(44, 56, 82, 0.18);
  }

  &.ant-btn-ordinary.ant-btn-dangerous {
    --color: #{$text-light-serious};
    --border-color: #{$fills-light-serious-serious};

    --background-color: #{$white};
    --background-color-hover: linear-gradient(
        0deg,
        rgba(255, 74, 74, 0.16),
        rgba(255, 74, 74, 0.16)
      ),
      #ffffff;
    --background-color-active: linear-gradient(
        0deg,
        rgba(255, 74, 74, 0.2),
        rgba(255, 74, 74, 0.2)
      ),
      #ffffff;
    --box-shadow-color-focus: #{$strokes-light-serious-light};
  }

  &.ant-btn-ordinary-onTint {
    --color: #{$text-light-super};
    --border-color: #{$white};

    --background-color: #{$white};
    --background-color-hover: #{$fills-interaction-light-general-hover};
    --background-color-active: #{$fills-interaction-light-general-active};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};

    box-shadow: none;
  }

  &.ant-btn-ordinary-onTint.ordinary-blue {
    --color: #{$text-light-general};
    --border-color: #{$white};

    --background-color: #{$white};
    --background-color-hover: #{$fills-interaction-light-outstanding-hover};
    --background-color-active: #{$fills-interaction-light-outstanding-active};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};

    box-shadow: none;
  }

  &.ant-btn-ordinary-onTint.ant-btn-dangerous {
    --color: #{$text-light-serious};

    --background-color-hover: #{$fills-interaction-light-serious-hover};
    --background-color-active: #{$fills-interaction-light-serious-active};
    --box-shadow-color-focus: #{$strokes-light-serious-light};
  }

  &.ant-btn-quiet {
    --color: #{$text-light-secondary};
    --border-width: 0;

    --background-color: transparent;
    --background-color-hover: #{$fills-interaction-light-general-hover};
    --background-color-active: #{$fills-interaction-light-general-active};
    --background-color-focus: #{$white};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};
    box-shadow: none;
  }

  &.ant-btn-quiet.ant-btn-dangerous {
    --color: #{$text-light-serious};

    --background-color-hover: #{$fills-interaction-light-serious-hover};
    --background-color-active: #{$fills-interaction-light-serious-active};
    --box-shadow-color-focus: #{$strokes-light-serious-light};
  }

  &.ant-btn-quiet.quiet-blue {
    --color: #{$text-light-general};

    --background-color: transparent;
    --background-color-hover: #{$fills-interaction-light-outstanding-hover};
    --background-color-active: #{$fills-interaction-light-outstanding-active};
    --background-color-focus: #{$white};
    --box-shadow-color-focus: #{$strokes-light-outstanding-light};
  }

  &.has-icon {
    display: inline-flex;
    align-items: center;
  }

  .button-prefix-icon {
    margin-right: 4px;
    display: inline-flex;
  }
  .button-suffix-icon {
    margin-left: 4px;
    display: inline-flex;
  }
  .icon-wrapper {
    display: inline-flex;
    vertical-align: bottom;
  }
`;

const NoPadding = css`
  padding: 0;
`;

export type ButtonProps = {
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
