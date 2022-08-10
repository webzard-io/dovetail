import { css, cx } from '@linaria/core';

export const CheckboxStyle = css`
  color: $text-primary-light;
  line-height: 22px;
  display: inline-flex;

  .dovetail-ant-checkbox {
    height: 22px;
    display: flex;
    align-items: center;
    top: 0;
  }
  .dovetail-ant-checkbox-checked::after {
    border: none;
  }
  &.dovetail-ant-checkbox-wrapper:hover .dovetail-ant-checkbox-inner,
  &.dovetail-ant-checkbox-wrapper.__pseudo-states-hover .dovetail-ant-checkbox-inner,
  .dovetail-ant-checkbox:hover .dovetail-ant-checkbox-inner {
    border-color: $fills-light-general-general;
  }

  .dovetail-ant-checkbox .dovetail-ant-checkbox-inner {
    border: 1px solid $strokes-light-trans-4;
  }
  .dovetail-ant-checkbox.dovetail-ant-checkbox-checked,
  .dovetail-ant-checkbox.dovetail-ant-checkbox-indeterminate {
    .dovetail-ant-checkbox-inner {
      border: 1px solid $fills-light-general-general;
    }
  }

  .dovetail-ant-checkbox.dovetail-ant-checkbox-indeterminate .dovetail-ant-checkbox-inner {
    background: $fills-light-general-general;
    &:after {
      background-color: $white;
      height: 2px;
      width: 10px;
      border-radius: 2px;
    }
  }

  &.dovetail-ant-checkbox-wrapper-disabled {
    opacity: 0.5;
    .dovetail-ant-checkbox-disabled .dovetail-ant-checkbox-inner {
      background: $fills-light-trans-3;
      border-color: $strokes-light-trans-4 !important;
    }
    .dovetail-ant-checkbox-disabled.dovetail-ant-checkbox-checked .dovetail-ant-checkbox-inner:after {
      border-color: $text-primary-light;
    }
    .dovetail-ant-checkbox-disabled.dovetail-ant-checkbox-indeterminate
      .dovetail-ant-checkbox-inner:after {
      background: $text-primary-light;
    }
  }

  .dovetail-ant-checkbox + span,
  .dovetail-ant-checkbox-disabled + span {
    padding: 0;
    .main {
      display: inline-block;
      margin-left: 12px;
      color: $text-primary-light;
    }
    .sub {
      margin-left: 28px;
      color: $text-secondary-light;
    }
  }

  &.compact {
    .dovetail-ant-checkbox + span,
    .dovetail-ant-checkbox-disabled + span {
      .main {
        margin-left: 8px;
      }
      .sub {
        margin-left: 24px;
      }
    }
  }
`;
