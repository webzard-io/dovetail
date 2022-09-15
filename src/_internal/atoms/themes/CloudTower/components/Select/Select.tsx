import React, { useEffect, useMemo, useRef } from "react";
import { findDOMNode } from "react-dom";
import cs from "classnames";
import { css } from "@linaria/core";
import { Select as AntdSelect } from "antd";
import { SelectProps as AntdSelectProps } from "antd/lib/select/index";
import { Typo } from "../../styles/typo.style";
import Loading from "../Loading/Loading";
import { debounce } from 'lodash';

export type SelectProps = {
  defaultValue?: string;
  error?: unknown | React.ReactNode;
  danger?: boolean;
  multiple?: boolean;
  scrollBottomBuffer?: number;
  onScrollBottom?: () => void;
  selectLimit?: number;
  onChange: (value: string | string[], option: any) => void;
} & Omit<AntdSelectProps<string>, "onChange">;

const SelectStyle = css`
  &.dovetail-ant-select,
  &.dovetail-ant-select .dovetail-ant-select-selector {
    border-radius: 6px;
  }

  &.dovetail-ant-select.dovetail-ant-select-single {
    width: 100%;
    height: 30px;
    color: $text-primary-light;
    border-color: $strokes-light-trans-2;
    transition: border 160ms ease 8ms, box-shadow 160ms ease 8ms;
    font-size: 13px;

    &.dovetail-ant-select-lg {
      height: 38px;
      font-size: 13px;
    }

    .dovetail-ant-select-arrow,
    .dovetail-ant-select-arrow .anticon-down {
      transition: 160ms ease;
    }

    .dovetail-ant-select-arrow-loading {
      color: $fills-light-general-general;
    }

    &:not(.dovetail-ant-select-disabled) {
      &:hover .dovetail-ant-select-selector,
      &.__pseudo-states-hover .dovetail-ant-select-selector {
        border-color: $strokes-light-trans-4;
        box-shadow: $shadow-light-hover;
      }

      &:hover .dovetail-ant-select-arrow,
      &.__pseudo-states-hover .dovetail-ant-select-arrow {
        color: $fills-light-general-general;
      }

      &:active,
      &:focus,
      &.dovetail-ant-select-focused,
      &.dovetail-ant-select-open,
      &.__pseudo-states-active,
      &.__pseudo-states-focus {
        .dovetail-ant-select-selector {
          border-color: $fills-light-general-general;
          box-shadow: $shadow-light-active;
        }
      }

      &.dovetail-ant-select-open .dovetail-ant-select-arrow .anticon-down {
        transform: rotate(180deg);
      }
    }

    &.select-error:not(.dovetail-ant-select-disabled) {
      .dovetail-ant-select-selector {
        border-color: $fills-light-serious-serious !important;
      }

      &:hover .dovetail-ant-select-arrow,
      &.__pseudo-states-hover .dovetail-ant-select-arrow {
        color: $text-light-super;
      }

      &:active,
      &:focus,
      &.dovetail-ant-select-focused,
      &.dovetail-ant-select-open,
      &.__pseudo-states-focus,
      &.__pseudo-states-active {
        .dovetail-ant-select-selector {
          border-color: $fills-light-general-general;
          box-shadow: $shadow-light-error;
        }
      }

      &.dovetail-ant-select-open .dovetail-ant-select-arrow .anticon-down {
        transform: rotate(180deg);
      }
    }

    &.dovetail-ant-select-disabled .dovetail-ant-select-selector {
      background: $fills-light-trans-3;
      border-color: $strokes-light-trans-3;
      cursor: "not-allowed";
    }
  }
`;

const Select: React.FC<SelectProps> = ({
  value,
  multiple,
  className,
  scrollBottomBuffer = 0,
  onScrollBottom,
  onPopupScroll,
  onSearch,
  showSearch,
  filterOption,
  loading,
  notFoundContent,
  children,
  error,
  selectLimit,
  dropdownClassName,
  danger,
  size = "middle",
  placeholder,
  onChange,
  onBlur,
  ...restProps
}) => {
  const limitExceeded =
    multiple && selectLimit && selectLimit <= (value?.length || 0);
  const typo = {
    large: Typo.Label.l2_regular,
    middle: Typo.Label.l3_regular,
    small: Typo.Label.l4_regular,
  }[size];
  const _danger = useMemo(() => {
    if (danger !== undefined) {
      return danger;
    }
  }, [danger]);

  const selectRef = useRef(null);
  // recommended by antd https://github.com/ant-design/ant-design/issues/26269#issuecomment-675818652
  useEffect(() => {
    if (!selectRef.current) {
      return;
    }
    const realDom = findDOMNode(selectRef.current);
    if (realDom) {
      const inputDom = (realDom as HTMLDivElement).getElementsByClassName(
        "ant-select-selection-search-input"
      )[0];
      const item = (realDom as HTMLDivElement).getElementsByClassName(
        "ant-select-selection-item"
      )[0];
      inputDom &&
        (placeholder || item) &&
        inputDom.setAttribute(
          "data-test",
          String(placeholder || item.textContent)
        );
    }
  }, [selectRef, placeholder]);

  return (
    <AntdSelect
      {...restProps}
      ref={selectRef}
      size={size}
      value={multiple ? value || [] : value || undefined}
      onChange={(e: string | string[], option) => {
        if (Array.isArray(e) && e.some((v) => v === "")) {
          // TODO: improve type
          /* eslint-disable @typescript-eslint/no-explicit-any */
          onChange?.([], option as any);
        } else {
          onChange?.(e, option as any);
          /* eslint-enable @typescript-eslint/no-explicit-any */
        }
      }}
      onBlur={(e) => onBlur?.(e)}
      mode={multiple ? "multiple" : undefined}
      className={cs(
        SelectStyle,
        "select",
        className,
        limitExceeded && "select-event-none",
        _danger ? "select-error" : "",
        typo
      )}
      dropdownClassName={cs(dropdownClassName, limitExceeded && "display-none")}
      showSearch={
        multiple
          ? undefined
          : typeof showSearch === "undefined"
          ? Boolean(onSearch)
          : showSearch
      }
      filterOption={
        onSearch === undefined
          ? filterOption === undefined
            ? (input, option) => {
                const label = option?.label;
                if (!label || typeof label !== "string") {
                  return false;
                }
                return label.toLowerCase().includes(input.toLowerCase());
              }
            : filterOption
          : false
      }
      onSearch={onSearch && debounce(onSearch, 100)}
      onPopupScroll={(e) => {
        onPopupScroll?.(e);
        const el = e.currentTarget;
        if (
          el.scrollHeight - el.offsetHeight - el.scrollTop <=
          scrollBottomBuffer
        ) {
          onScrollBottom?.();
        }
      }}
      notFoundContent={loading ? <Loading /> : notFoundContent}
      dropdownRender={(menu) => <>{error || menu}</>}
      loading={loading}
      placeholder={placeholder}
      {...restProps}
    >
      {children}
    </AntdSelect>
  );
};

export default Select;
