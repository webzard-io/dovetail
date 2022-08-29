import React, { useState, useEffect } from "react";
import { cx } from "@linaria/core";
import { IconWrapper } from "./Icon.style";
import pickBy from "lodash/pickBy";
import ArrowChevronUp16BoldSecondary from "../../images/1-arrow-chevron-up-16-bold-secondary.svg";
import ArrowChevronDown16Blue from '../../images/1-arrow-chevron-down-16-blue.svg';
import ArrowChevronDown16BoldBlue from '../../images/1-arrow-chevron-down-16-bold-blue.svg';
import ArrowChevronDownSmall16Blue from '../../images/1-arrow-chevron-down-small-16-blue.svg';
import ArrowChevronDownSmall16BoldBlue from '../../images/1-arrow-chevron-down-small-16-bold-blue.svg';
import ArrowChevronDownSmall16Secondary from '../../images/1-arrow-chevron-down-small-16-secondary.svg';
import ArrowChevronLeftSmall16BoldBlue from '../../images/1-arrow-chevron-left-small-16-bold-blue.svg';
import SettingGear16GradientBlue from '../../images/1-settings-gear-16-gradient-blue.svg';
import SettingGear16GradientGray from '../../images/1-settings-gear-16-gradient-gray.svg';
import StatusUnknownQuestionmark16Red from '../../images/1-status-unknown-questionmark-16-red.svg';
import ExclamationErrorCircleFill16Red from '../../images/1-exclamation-error-circle-fill-16-red.svg';
import XmarkRemove16Secondary from '../../images/1-xmark-remove-16-secondary.svg';

const ICON_MAP = {
  '1-arrow-chevron-down-16-blue': ArrowChevronDown16Blue,
  '1-arrow-chevron-down-16-bold-blue': ArrowChevronDown16BoldBlue,
  '1-arrow-chevron-down-small-16-blue': ArrowChevronDownSmall16Blue,
  '1-arrow-chevron-down-small-16-bold-blue': ArrowChevronDownSmall16BoldBlue,
  '1-arrow-chevron-down-small-16-secondary': ArrowChevronDownSmall16Secondary,
  '1-arrow-chevron-up-16-bold-secondary': ArrowChevronUp16BoldSecondary,
  '1-arrow-chevron-left-small-16-bold-blue': ArrowChevronLeftSmall16BoldBlue,
  '1-settings-gear-16-gradient-blue': SettingGear16GradientBlue,
  '1-settings-gear-16-gradient-gray': SettingGear16GradientGray,
  '1-status-unknown-questionmark-16-red': StatusUnknownQuestionmark16Red,
  '1-xmark-remove-16-secondary': XmarkRemove16Secondary,
  '1-exclamation-error-circle-fill-16-red': ExclamationErrorCircleFill16Red
};

export type IconTypes = keyof typeof ICON_MAP;

type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
  type: IconTypes;
  active?: boolean;
  hoverType?: IconTypes;
  activeType?: IconTypes;
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
  const [src, setSrc] = useState('');
  const defaultWidth = 16;
  const _iconWidth = iconWidth || (type.includes("24") ? 24 : defaultWidth);
  const _iconHeight = iconHeight || _iconWidth;

  useEffect(() => {
    (async ()=> {
      let src = ''
      
      if (active && activeType) {
        src = ICON_MAP[activeType];
      } else if (hover && hoverType) {
        src = ICON_MAP[hoverType];
      } else if (type) {
        src = ICON_MAP[type];
      }
  
      setSrc(src);
    })()
  }, [active, activeType, hoverType, type, hover, fileFormat]);

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
          src={src}
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
