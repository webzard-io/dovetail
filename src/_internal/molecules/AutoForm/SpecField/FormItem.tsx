import React, { useState, useEffect } from "react";
// TODO: use kit context when I have time:)
import { Form } from "antd";
import { css, cx } from "@linaria/core";
import { WidgetProps } from "../widget";
import { Typo } from "../../../atoms/themes/CloudTower/styles/typo.style";
import { Field, Services } from "../../../organisms/KubectlApplyForm/type";
import useValidate from "./useValidate";

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
  
    &.dovetail-ant-form-item
      > .dovetail-ant-form-item-control
      > .dovetail-ant-form-item-explain {
      display: none;
      line-height: 18px;
      font-size: 12px;
      color: rgba(240, 72, 62);
      margin-top: 4px;
      min-height: 18px;
    }
  
    &.dovetail-ant-form-item-has-error {
      & > .dovetail-ant-form-item-control > .dovetail-ant-form-item-explain {
        display: block;
      }
    }
  
    .dovetail-ant-form-item-label {
      padding: 0;
      font-family: "Inter";
      font-weight: 400;
      font-size: 13px;
      line-height: 20px;
      word-break: break-word;
      white-space: pre-wrap;
  
      label:after {
        content: "";
        margin: 0;
      }
    }
  
    .dovetail-ant-form-item-control {
      flex: 1;
      min-width: 0;
    }
  
    .dovetail-ant-form-item-extra {
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
  
    &.dovetail-ant-form-item-has-error .ant-select-selector,
    &.dovetail-ant-form-item-has-error .ant-input {
      border-color: #f0483e !important;
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
      <Form.Item
        className={FormItemStyle}
        labelAlign="left"
        label={
          displayLabel ? (
            <span
              style={{ width: labelWidth || `${108}px` }}
              className={cx(Typo.Label.l3_regular_title, FormItemLabelStyle)}
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
      </Form.Item>
    );
  }
);

export default FormItem;
