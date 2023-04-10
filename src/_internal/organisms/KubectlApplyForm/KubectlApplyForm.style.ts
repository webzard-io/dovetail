import { css } from "@linaria/core";

export const KubectlApplyFormStyle = css`
  display: flex;
  flex-direction: column;
`;

export const FormWrapperStyle = css`
  overflow: hidden;
  flex: 1;
`;

export const WizardStyle = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const WizardBodyWrapperStyle = css`
  overflow: auto;
  height: 100%;
`;

export const WizardBodyStyle = css`
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex: 1;

  .left,
  .right {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 21%;
  }

  .left {
    display: flex;
    justify-content: flex-end;
    padding-right: 44px;
  }

  .right {
    padding-left: 44px;
    height: calc(100% - 40px);
  }

  .middle {
    display: flex;
    flex-direction: column;
    align-content: flex-start;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 58%;
    margin-bottom: 40px;

    .middle-form-wrapper {
      flex: 1;
      width: 100%;
      margin-bottom: 40px;
    }

    .error-alert {
      width: 100%;
      margin: 0 12px;
      margin-bottom: 16px;

      &-title {
        margin-bottom: 8px;
      }

      .anticon-close-circle {
        display: flex;
        align-items: center;
      }
    }

    .form-base-field {
      width: 100%;
      .form-base-field {
        width: auto;
      }
    }
  }

  .dovetail-ant-steps-vertical .dovetail-ant-steps-item {
    flex: initial;
  }

  .dovetail-ant-steps-item + .dovetail-ant-steps-item {
    margin-top: 4px;
  }

  .dovetail-ant-steps-item-icon,
  .dovetail-ant-steps-item-tail {
    display: none !important;
  }

  .dovetail-ant-steps-item-container {
    padding: 0 15px;
    border-radius: 4px;
    height: 32px;
    display: flex;
    align-items: center;

    .dovetail-ant-steps-item-content {
      min-height: auto;
      white-space: nowrap;
    }
  }

  .dovetail-ant-steps-item-description {
    padding-bottom: 0px;
  }

  .dovetail-ant-steps-item-title {
    font-size: 13px !important;
    line-height: 20px !important;
    .step-index {
      display: inline-block;
      text-align: center;
      width: 13px;
      margin-right: 12px;
    }
  }

  .dovetail-ant-steps-item-active {
    .dovetail-ant-steps-item-container {
      background: rgba($blue-60, 0.1);
      .dovetail-ant-steps-item-content .dovetail-ant-steps-item-title {
        color: $blue-80;
      }
    }
  }

  .dovetail-ant-steps-item-finish {
    .dovetail-ant-steps-item-container {
      background: $gray-a60-1;
      .dovetail-ant-steps-item-content .dovetail-ant-steps-item-title {
        color: $text-terdiary-light !important;
      }
    }
  }

  .dovetail-ant-steps-item-disabled {
    cursor: not-allowed;

    .dovetail-ant-steps-item-container {
      background: $gray-a60-1;
      .dovetail-ant-steps-item-content .dovetail-ant-steps-item-title {
        color: $gray-80;
      }
    }
  }
`;

export const WizardFooterStyle = css`
  background: rgba(237, 241, 250, 0.6);
  padding: 15px 0;

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    max-width: 1120px;
    width: 100%;

    &:before,
    &:after {
      content: "";
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 21%;
    }

    .middle {
      display: flex;
      justify-content: space-between;
      flex-shrink: 0;
      flex-basis: 58%;
      align-items: center;
      > *:last-child {
        margin-bottom: 40px;
      }
    }

    .wizard-footer-left {
      display: flex;
      align-items: center;
      .anticon-exclamation-circle {
        color: $red-60;
        margin-right: 5px;
      }
      .wizard-error {
        display: flex;
        align-items: flex-start;
        margin-right: 12px;
        font-size: 13px;
        color: $red-60;
        text-align: left;

        .wizard-error-icon {
          margin-right: 6px;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .wizard-error-text {
          font-size: 14px;
          line-height: 22px;
          overflow: hidden;
        }
      }
      .prev-step {
        color: $blue-60;
        cursor: pointer;
        margin-right: 16px;
        flex-shrink: 0;
      }
    }

    button {
      font-size: 14px;
      font-weight: bold;
      padding: 0 16px;
      border: none;

      &.footer-cancel-button,
      &.ant-btn-ghost {
        background: transparent;
        color: rgba(62, 70, 82, 0.6);

        &:hover {
          background: rgba(223, 228, 235, 0.6);
        }
      }
    }

    button + button {
      margin-left: 8px;
    }

    > :only-child,
    .wizard-footer-btn-group {
      margin-left: auto;
      flex-shrink: 0;
    }
  }
`;
