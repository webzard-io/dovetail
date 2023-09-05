import React, { useState, useEffect } from "react";
// TODO: use kit context when I have time:)
import { css, cx } from "@linaria/core";
import { WidgetProps } from "../widget";
import { Typo } from "../../../atoms/themes/CloudTower/styles/typo.style";
import { Field, Services } from "../../../organisms/KubectlApplyForm/type";
import useValidate from "./useValidate";
import { useUIKit } from "@cloudtower/eagle";

type TemplateProps = {
  id?: string;
  field?: Field;
  item?: Field["subItem"];
  itemKey: string;
  value?: any;
  services: Services;
  label?: React.ReactNode;
  layout?: "horizontal" | "vertical";
  error?: string;
  widgetErrors: string[];
  description?: React.ReactNode;
  hidden?: boolean;
  required?: boolean;
  displayLabel?: boolean;
  labelWidth?: number;
  displayDescription?: boolean;
  spec: WidgetProps["spec"];
  testId?: string;
  children?: React.ReactNode;
};

export const HasMargin = css`
    margin-bottom: 16px;
  `;

const FormItemStyle = css`
    margin-bottom: 18px;
  
    &:last-child {
      margin-bottom: 0;
    }
  
    &.ant-form-item
      > .ant-form-item-control
      > .ant-form-item-explain {
      display: none;
      line-height: 18px;
      font-size: 12px;
      color: rgba(240, 72, 62);
      margin-top: 4px;
      min-height: 18px;
    }
  
    &.ant-form-item-has-error {
      & > .ant-form-item-control > .ant-form-item-explain {
        display: block;
      }
    }
  
    .ant-form-item-label {
      padding: 0;
      font-family: "Inter";
      font-weight: 400;
      font-size: 13px;
      line-height: 20px;
      word-break: break-word;
      white-space: pre-wrap;
  
      label:after {
        display: none;
        content: "";
        margin: 0;
      }
    }
  
    .ant-form-item-control {
      flex: 1;
      min-width: 0;
    }
  
    .ant-form-item-extra {
      min-height: 18px;
      margin-top: 4px;
      color: rgba(44, 56, 82, 0.6);
      font-family: "Inter";
      font-weight: 400;
      font-size: 12px;
      line-height: 18px;
  
      &:empty {
        display: none;
      }
    }

    .ant-form-item-control {
      .ant-input-affix-wrapper,
      .ant-input-affix-wrapper {
        .ant-input:hover,
        .ant-input:focus-within,
        .ant-input:hover, 
        .ant-input:focus-within {
          box-shadow: unset !important;
        }
      }
    }

  
    &.ant-form-item-has-error {
      .ant-select-selector,
      .ant-select-selector,
      .ant-input,
      .ant-input,
      .ant-input-affix-wrapper,
      .ant-input-affix-wrapper {
        border-color: #f0483e !important;
  
        &:hover {
          box-shadow: 0px 0px 0px 4px rgba(255, 74, 74, 0.16) !important;
        }
  
        &:focus-within {
          box-shadow: 0px 0px 0px 4px rgba(255, 74, 74, 0.16) !important;
        }
      }

    }
  `;

const FormItemLabelStyle = css`
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: rgba(44, 56, 82, 0.6);
    width: 108px;
  `;



const FormItem = React.forwardRef<HTMLDivElement, TemplateProps>(
  function FormItem(props, ref) {
    const {
      field,
      spec,
      item,
      value,
      itemKey,
      services,
      label,
      children,
      error,
      widgetErrors,
      description,
      hidden,
      displayLabel,
      labelWidth,
      displayDescription,
      testId,
    } = props;
    const [errors, setErrors] = useState<string[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const validate = useValidate({
      field,
      spec,
      item,
      value,
      itemKey,
      services,
      error,
      widgetErrors,
      onValidate(errors) {
        setErrors(errors);
      },
    })
    const kit = useUIKit();
    const displayError = field?.isHideError ? "" : error || errors?.[0] || widgetErrors[0] || "";

    useEffect(() => {
      if (isMounted) {
        validate();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (hidden) {
      return <div className="hidden">{children}</div>;
    }

    return (
      <kit.form.Item
        className={cx(FormItemStyle, itemKey, "kaf-form-item")}
        labelAlign="left"
        label={
          displayLabel ? (
            <span
              style={{ width: labelWidth || `${108}px` }}
              className={cx(Typo.Label.l3_regular_title, FormItemLabelStyle, "form-item-label")}
            >
              {label}
            </span>
          ) : (
            ""
          )
        }
        validateStatus={displayError ? "error" : ""}
        help={displayError}
        extra={description && displayDescription ? description : ""}
      >
        <div data-test-id={testId}>{children}</div>
      </kit.form.Item>
    );
  }
);

export default FormItem;
