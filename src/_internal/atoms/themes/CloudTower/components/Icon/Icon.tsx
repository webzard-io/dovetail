import React, { useState } from "react";
import { cx } from "@linaria/core";
import { IconWrapper } from "./Icon.style";
import pickBy from "lodash/pickBy";
import arrowUp from "../../images/1-arrow-chevron-up-16-bold-secondary.svg";

type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
  type: string;
  active?: boolean;
  hoverType?: string;
  activeType?: string;
  className?: string;
  alt?: string;
  iconWidth?: number;
  iconHeight?: number | "auto";
  cursor?: "pointer" | string;
  isRotate?: boolean;
  fileFormat?: "jpg" | "png" | "svg";
  prefix?: React.ReactNode;
  suffixType?: {
    type: string;
    hoverType?: string;
    activeType?: string;
  };
};

const Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
  const {
    type = "",
    hoverType,
    active,
    activeType,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    className,
    iconWidth,
    iconHeight,
    cursor,
    style,
    children,
    isRotate,
    prefix,
    suffixType,
    fileFormat = "svg",
    ...restProps
  } = props;
  const [hover, setHover] = useState(false);
  const defaultWidth = 16;
  const _iconWidth = iconWidth || (type.includes("24") ? 24 : defaultWidth);
  const _iconHeight = iconHeight || _iconWidth;

  return (
    <span
      ref={ref}
      className={cx(
        IconWrapper,
        "icon-wrapper",
        className,
        isRotate && "is-rotate"
      )}
      style={pickBy({ cursor: cursor, ...style })}
      {...restProps}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        if (hoverType) {
          setHover(true);
        }
      }}
      onMouseMove={(e) => {
        onMouseMove?.(e);
        if (hoverType) {
          setHover(true);
        }
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        if (hoverType) {
          setHover(false);
        }
      }}
    >
      {prefix}
      <span className="icon-inner">
        <img
          alt={type}
          src={arrowUp}
          width={`${_iconWidth}px`}
          height={
            typeof _iconHeight === "string" ? _iconHeight : `${_iconWidth}px`
          }
        />
      </span>
      {children && <span className="icon-children">{children}</span>}
    </span>
  );
});

export default Icon;
