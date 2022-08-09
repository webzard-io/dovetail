import React, { useContext, useEffect, useState } from "react";
import AutoForm, {
  AutoFormProps,
} from "../../_internal/molecules/AutoForm/AutoForm";
import { generateFromSchema } from "../utils/schema";
import { css as dCss, cx } from "@emotion/css";
import { css } from "@linaria/core";
import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { WidgetProps } from "../molecules/AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import { ButtonType } from "antd/lib/button";

export const WizardStyle = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const WizardBodyStyle = css`
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex: 1;
  overflow: auto;

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
  }

  .middle {
    margin-bottom: 40px;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 58%;
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
        margin-right: 12px;
        font-size: 13px;
        line-height: 20px;
        color: $red-60;
        text-align: left;
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

type UnstructuredFormProps = {
  spec: any;
  defaultValue?: any;
  renderer?: AutoFormProps["renderer"];
  onChange?: (value: any) => void;
  className?: string;
  wizard?: {
    steps: {
      title: string;
      disabled?: boolean;
      prevText?: string;
      nextText?: string;
    }[];
    disablePrevStep: boolean;
    defaultIndex: number;
    onCancel?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onStepChange?: (step: number) => void;
  };
  layout?: WidgetProps["layout"];
};

const UnstructuredForm = React.forwardRef<
  HTMLDivElement,
  UnstructuredFormProps
>(
  (
    { spec, defaultValue, renderer, onChange, className, wizard, layout },
    ref
  ) => {
    const kit = useContext(KitContext);
    const [value, setValue] = useState(
      defaultValue || generateFromSchema(spec)
    );
    useEffect(() => {
      onChange?.(value);
    }, [value, onChange]);
    const [step, setStep] = useState(wizard?.defaultIndex ?? 0);
    const currentStep = wizard?.steps[step];

    return (
      <div className={cx(wizard && WizardStyle)}>
        <div
          ref={ref}
          className={cx(
            dCss`
        width: 100%;
      `,
            wizard && WizardBodyStyle,
            className
          )}
        >
          {Boolean(wizard) && (
            <div className="left">
              <Steps
                style={{ minWidth: 192 }}
                current={step}
                onChange={(value) => {
                  setStep(value);
                  wizard?.onStepChange?.(value);
                }}
                direction="vertical"
              >
                {(wizard?.steps || []).map((s, idx) => (
                  <Steps.Step
                    key={idx}
                    title={
                      <>
                        {idx >= step ? (
                          <span className="step-index">{idx + 1}</span>
                        ) : (
                          <CheckOutlined className="step-index" />
                        )}
                        {s.title}
                      </>
                    }
                    disabled={
                      s.disabled ||
                      idx > step ||
                      (wizard?.disablePrevStep && idx !== step)
                    }
                  />
                ))}
              </Steps>
            </div>
          )}
          <div className={cx(Boolean(wizard) && "middle")}>
            <AutoForm
              spec={spec}
              value={value}
              onChange={(newV) => {
                setValue(newV);
              }}
              level={0}
              path=""
              step={wizard ? step : undefined}
              layout={layout}
              renderer={renderer}
            />
          </div>
          {Boolean(wizard) && <div className="right"></div>}
        </div>
        {Boolean(wizard) && (
          <div className={WizardFooterStyle}>
            <div className="footer-content">
              <div className="wizard-footer-left">
                {!wizard?.disablePrevStep && step !== 0 && (
                  <span
                    className="prev-step"
                    onClick={() => {
                      setStep(step - 1);
                      wizard?.onStepChange?.(step - 1);
                      wizard?.onPrevious?.();
                    }}
                  >
                    {currentStep?.prevText || "previous"}
                  </span>
                )}
              </div>
              <div className="wizard-footer-btn-group">
                <kit.Button
                  type={(`quiet` as unknown) as ButtonType}
                  onClick={() => {
                    wizard?.onCancel?.();
                  }}
                >
                  cancel
                </kit.Button>
                <kit.Button
                  type="primary"
                  onClick={() => {
                    setStep(step + 1);
                    wizard?.onStepChange?.(step + 1);
                    wizard?.onNext?.();
                  }}
                >
                  {currentStep?.nextText || "next"}
                </kit.Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default UnstructuredForm;
