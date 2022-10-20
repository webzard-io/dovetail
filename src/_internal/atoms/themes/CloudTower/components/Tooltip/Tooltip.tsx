import React, { useRef, useMemo, useEffect, useCallback } from "react";
import { Tooltip as AntdTooltip } from "antd";
import cs from "classnames";
import { TooltipProps as AntdTooltipProps } from "antd/lib/tooltip";

export type TooltipProps = AntdTooltipProps & {
  followMouse?: boolean;
};

let componentId = 0;
const Tooltip: React.FunctionComponent<TooltipProps> = (props) => {
  const {
    followMouse,
    overlayClassName,
    overlayStyle,
    children,
    ...restProps
  } = props;
  const id = useRef(++componentId);
  const uniquePopupClass = `kit-popup-${id.current}`;
  const uniqueContainerClass = `kit-tooltip-${id.current}`;

  const _children = useMemo(() => {
    if (followMouse) {
      // clone children, add class to children
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child: React.ReactElement<any> = React.isValidElement(children) ? (
        children
      ) : (
        <span>{children}</span>
      );

      return React.cloneElement(child, {
        className: cs(child.props.className, uniqueContainerClass),
      });
    } else {
      return children;
    }
  }, [children, followMouse, uniqueContainerClass]);

  const onmousemove = useCallback(
    (event: MouseEvent) => {
      const popup = document.querySelector<HTMLElement>(`.${uniquePopupClass}`);
      if (!popup) return;
      popup.style.left = event.pageX + "px";
      popup.style.top = event.pageY + "px";
    },
    [uniquePopupClass]
  );

  useEffect(() => {
    if (followMouse) {
      const container = document.querySelector<HTMLElement>(
        `.${uniqueContainerClass}`
      );
      container?.addEventListener("mousemove", onmousemove);
      return () => {
        container?.removeEventListener("mousemove", onmousemove);
      };
    }
  }, [followMouse, onmousemove, uniqueContainerClass]);

  return (
    <AntdTooltip
      {...restProps}
      overlayClassName={
        followMouse ? cs(overlayClassName, uniquePopupClass) : overlayClassName
      }
      children={_children}
      overlayStyle={
        followMouse
          ? {
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              ...overlayStyle,
            }
          : overlayStyle
      }
    />
  );
};

export default Tooltip;
