import { cx, css } from "@linaria/core";
import React, { useState, useMemo, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";
import { KitContext } from "../atoms/kit-context";
import Icon from "../atoms/themes/CloudTower/components/Icon/Icon";

const SYSTEM_LABEL_PREFIX = "system.cloudtower/";

function getLabelText(
  label?: { key: string; value?: string | null } | null
): string {
  if (!label || !label.key) return "";
  return label.value ? `${label.key}:${label.value}` : label.key;
}

const TagStyle = css`
  margin-right: 8px;
  padding: 3px 8px;
  color: $text-light-primary;
  background: $fills-element-light-container-general;
  border-radius: 4px;
  border: none;
  display: inline-flex;
  align-items: center;

  .label-text {
    word-break: break-all;
    &.should-ellipsis {
      white-space: nowrap;
    }
  }
  .icon-wrapper {
    cursor: pointer;
  }
`;

const TagEllipsisStyle = css`
  width: 100%;
  
  .label-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const LabelTag: React.FC<{
  label: {
    key: string;
    value?: string | null;
  };
  showEllipsis?: boolean;
  remove?: () => void;
}> = ({ label, showEllipsis = true, remove }) => {
  const { t } = useTranslation();
  const kit = useContext(KitContext);
  const tagRef = useRef<HTMLDivElement>(null);
  const tagWidthRef = useRef<number>(0);
  const [ellipsis, setEllipsis] = useState(false);
  const labelText = getLabelText(label);

  const nativeProperties = useMemo(() => {
    const properties: { title?: string } = {};
    if (ellipsis) properties.title = labelText;
    return properties;
  }, [labelText, ellipsis]);

  const parentWidthRef = useRef(0);

  useEffect(() => {
    if (!showEllipsis) return;

    const element = tagRef.current;
    // store initial tag width before it is truncated
    if (!ellipsis && element) tagWidthRef.current = element.scrollWidth;

    const parentElement = element?.parentElement;

    let observer: ResizeObserver;

    if (element && parentElement) {
      observer = new ResizeObserver((entries) => {
        if (entries.length === 1) {
          const parentWidth = entries[0].contentRect.width >> 0;
          if (parentWidth !== parentWidthRef.current) {
            setEllipsis(parentWidth <= tagWidthRef.current);
            parentWidthRef.current = parentWidth;
          }
        }
      });
      observer.observe(parentElement);
    }

    return () => {
      observer?.disconnect();
    };
  }, [ellipsis, showEllipsis, tagRef]);

  if (label.key.startsWith(SYSTEM_LABEL_PREFIX)) {
    // hide system labels
    return null;
  }

  return (
    <div
      className={cx(
        Typo.Label.l4_regular,
        TagStyle,
        "tag",
        ellipsis ? TagEllipsisStyle : ""
      )}
      ref={tagRef}
      {...nativeProperties}
    >
      <span
        className={cx(
          "label-text",
          showEllipsis ? "should-ellipsis" : undefined
        )}
      >
        {labelText}
      </span>
      {typeof remove === "function" ? (
        <Icon
          type="1-xmark-remove-small-16-secondary"
          hoverType="1-xmark-remove-small-16-blue"
          onClick={remove}
        ></Icon>
      ) : null}
    </div>
  );
};

export default LabelTag;
