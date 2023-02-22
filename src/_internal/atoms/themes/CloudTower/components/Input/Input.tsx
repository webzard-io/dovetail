import { Typo } from "../../styles/typo.style";
import { Input as AntdInput } from "antd";
import { InputProps as AntdInputProps } from "antd/lib/input/Input";
import { css } from "@linaria/core";
import cs from "classnames";
import useInt from "./useInt";
import React, { useCallback, useState } from "react";

export const InputStyle = css`
  &.dovetail-ant-input {
    padding: 5px 12px;
    line-height: 20px;
    color: $text-primary-light;
    border-radius: 6px;
    border-color: $strokes-light-trans-3;
    transition: height 240ms ease 8ms, border 160ms ease 8ms,
      box-shadow 160ms ease 8ms;
  }

  &.dovetail-ant-input.dovetail-ant-input-lg {
    padding: 8px 16px;
    line-height: 22px;
  }

  &.dovetail-ant-input.dovetail-ant-input-sm {
    padding: 2px 8px;
    line-height: 18px;
  }

  .dovetail-ant-input.dovetail-ant-input:hover {
    border: 0;
    box-shadow: none;
  }

  &.dovetail-ant-input:not([disabled]),
  &.dovetail-ant-input-number:not([disabled]) {
    &:hover,
    &.__pseudo-states-hover {
      border-color: $strokes-light-trans-4;
      box-shadow: $shadow-light-hover;
    }

    &:active,
    &:focus,
    &.__pseudo-states-active,
    &.__pseudo-states-focus {
      border-color: $blue;
      box-shadow: $shadow-light-active;
    }
  }

  &.dovetail-ant-input.error:not([disabled]),
  &.dovetail-ant-picker.error:not([disabled]),
  &.dovetail-ant-input-number.error:not([disabled]) {
    border-color: $red;
    color: $red;

    &:hover,
    &.__pseudo-states-hover {
      border-color: $red;
      box-shadow: $shadow-light-hover;
    }

    &:active,
    &:focus,
    &.__pseudo-states-active,
    &.__pseudo-states-focus {
      border-color: $red;
      box-shadow: $shadow-light-error;
    }
  }

  &.dovetail-ant-input[disabled],
  &.dovetail-ant-input.dovetail-ant-input-disabled,
  &.dovetail-ant-input-number[disabled],
  &.dovetail-ant-input-number.dovetail-ant-input-number-disabled {
    background: $fills-trans-terdiary-light;
    color: $text-light-tertiary;
    border-color: $strokes-light-trans-3;
  }

  &.dovetail-ant-input-affix-wrapper {
    padding: 5px 12px;
    border-radius: 6px;
    border-color: $strokes-light-trans-3;
    line-height: 20px;
    color: $text-primary-light;
    transition: height 240ms ease 8ms, border 160ms ease 8ms,
      box-shadow 160ms ease 8ms;

    .dovetail-ant-input-suffix,
    .dovetail-ant-input-prefix {
      color: $text-secondary-light;
    }
  }

  &.dovetail-ant-input-affix-wrapper.dovetail-ant-input-affix-wrapper-lg {
    padding: 8px 16px;
    line-height: 22px;
  }

  &.dovetail-ant-input-affix-wrapper.dovetail-ant-input-affix-wrapper-sm {
    padding: 2px 8px;
    line-height: 18px;
  }

  &.dovetail-ant-input-affix-wrapper:not(
      .dovetail-ant-input-affix-wrapper-disabled
    ) {
    &:hover,
    &.__pseudo-states-hover {
      border-color: $strokes-light-trans-4;
      box-shadow: $shadow-light-hover;
    }

    &:active,
    &:focus,
    &.dovetail-ant-input-affix-wrapper-focused,
    &.__pseudo-states-active,
    &.__pseudo-states-focus {
      border-color: $blue;
      box-shadow: $shadow-light-active;
    }
  }

  &.dovetail-ant-input-affix-wrapper.error:not(
      .dovetail-ant-input-affix-wrapper-disabled
    ) {
    border-color: $red;
    > .dovetail-ant-input {
      color: $red;
    }

    &:hover,
    &.__pseudo-states-hover {
      border-color: $red;
      box-shadow: $shadow-light-hover;
    }

    &:active,
    &:focus,
    &.dovetail-ant-input-affix-wrapper-focused,
    &.__pseudo-states-active,
    &.__pseudo-states-focus {
      border-color: $red;
      box-shadow: $shadow-light-error;
    }
  }

  &.dovetail-ant-input-affix-wrapper.dovetail-ant-input-affix-wrapper-disabled {
    background: $fills-trans-terdiary-light;
    color: $text-light-tertiary;
    border-color: $strokes-light-trans-3;

    .dovetail-ant-input-disabled {
      background: unset;
      border: 0;
    }
  }

  @at-root {
    textarea#{&}.dovetail-ant-input {
      transition-property: height;
      transition-delay: 50ms;
      &.textarea-large {
        min-height: 40px;
        height: 40px;
      }
      &.textarea-large:focus {
        height: 80px;
      }
      &.textarea-middle {
        min-height: 32px;
        height: 32px;
      }
      &.textarea-middle:focus {
        height: 64px;
      }
      &.textarea-small {
        min-height: 24px;
        height: 24px;
      }
      &.textarea-small:focus {
        height: 40px;
      }
    }
  }
`;

type InputProps = Omit<AntdInputProps, "onChange"> & {
  error?: boolean;
  supportNegativeValue?: boolean;
  maximum?: number;
  minimum?: number;
  type: AntdInputProps["type"] | "int";
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string | number | undefined
  ) => void;
};

const Input: React.FC<InputProps> = ({
  className,
  error,
  size = "middle",
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const typo = {
    large: Typo.Label.l2_regular,
    middle: Typo.Label.l3_regular,
    small: Typo.Label.l4_regular,
  }[size];

  const { onChange: onIntChange, onBlur: onInputBlur } = useInt(props);

  const onChange = useCallback(
    (e) => {
      if (props.type === "int") {
        onIntChange(e);
      } else {
        props.onChange?.(e, e.target.value);
      }
    },
    [onIntChange, props.type, props.onChange]
  );

  return props.type === "password" ? (
    <AntdInput.Password
      {...props}
      className={cs(className, InputStyle, typo, error ? "error" : "")}
      size={size}
      onChange={onChange}
      onBlur={onInputBlur}
      visibilityToggle
    ></AntdInput.Password>
  ) : (
    <AntdInput
      {...props}
      className={cs(className, InputStyle, typo, error ? "error" : "")}
      size={size}
      onChange={onChange}
      onBlur={onInputBlur}
    />
  );
};

export default Input;
