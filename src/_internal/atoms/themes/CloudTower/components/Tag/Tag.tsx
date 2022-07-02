import React, { useState, useRef, useEffect } from "react";
import { Tag as BaseTag } from "antd";
import { cx } from "@linaria/core";
import { TagStyle } from "./Tag.style";

type TagProps = {
  className?: string;
  children?: React.ReactNode;
  color?: string;
  closable?: boolean;
  onClose?: () => void;
};

const Tag = React.forwardRef<HTMLElement, TagProps>((props, ref) => {
  const { className, children, color, closable, onClose } = props;
  const [expanded, setExpanded] = useState(false);
  const [, forceRender] = useState(0);
  const elRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (ref && typeof ref === "object") {
      ref.current = elRef?.current;
    }
    if (elRef.current) {
      forceRender(1);
    }
  }, []);
  const expandable = elRef.current
    ? elRef.current.clientWidth < elRef.current.scrollWidth
    : false;

  return (
    <BaseTag
      className={cx(
        className,
        TagStyle,
        expandable && "expandable",
        expanded && "expanded"
      )}
      ref={elRef}
      color={color}
      closable={closable}
      onClose={onClose}
      onClick={() => {
        if (!expanded && !expandable) {
          return;
        }
        setExpanded(!expanded);
        setTimeout(() => {
          forceRender((prev) => prev + 1);
        }, 0);
      }}
    >
      {children}
    </BaseTag>
  );
});

export default Tag;
