import { JSONSchema7 } from "json-schema";
import React, { useContext, useMemo, useState } from "react";
import get from "lodash/get";
import set from "lodash/set";
import groupBy from "lodash/groupBy";
import { getFields } from "../../molecules/AutoForm/get-fields";
import CodeEditor from "../../atoms/CodeEditor";
import yaml, { dump } from "js-yaml";
import {
  KubectlApplyFormStyle,
  FormWrapperStyle,
  WizardBodyStyle,
  WizardFooterStyle,
  WizardStyle,
} from "./KubectlApplyForm.style";
import { cx, css as dCss } from "@emotion/css";
import { Steps, Popover, Row } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import SpecField from "../../molecules/AutoForm/SpecField";
import Icon from "../../atoms/themes/CloudTower/components/Icon/Icon";
// FIXME: use kit
import {
  Switch,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { KitContext } from "src/_internal/atoms/kit-context";
import { ButtonType } from "antd/lib/button";
import SummaryList from "../../atoms/themes/CloudTower/components/SummaryList";
import useSummary from "./useSummary";
import { Typo } from "../../atoms/themes/CloudTower/styles/typo.style";
import { Field, TransformedField, Layout } from "./type";
import { transformFields } from "./utils";

export type KubectlApplyFormProps = {
  className?: string;
  basePath: string;
  applyConfig: {
    create?: boolean;
    patch?: boolean;
  };
  schemas: JSONSchema7[];
  uiConfig: {
    allowToggleYaml: boolean;
    isDisplaySummary?: boolean;
    isDisplayFooter?: boolean;
    title?: string;
    layout: Layout;
    confirmText: string;
    cancelText: string;
  };
  values: any[];
  defaultValues: any[];
  error?: string;
  errorDetail?: string;
  submitting?: boolean;
  step: number;
  setStep: (step: number) => void;
  getSlot?: (
    f: Field & { index?: number; },
    fallback: React.ReactNode,
    slotKey: string
  ) => React.ReactNode;
  onChange: (values: any[], key?: string) => void;
  onNextStep?: (values: any[]) => void;
  onSubmit?: (values: any[]) => void;
  onCancel?: () => void;
};

const KubectlApplyForm = React.forwardRef<
  HTMLDivElement,
  KubectlApplyFormProps
>(
  (
    {
      className,
      schemas = [],
      uiConfig,
      values,
      defaultValues,
      error,
      errorDetail,
      submitting,
      onChange,
      getSlot,
      step,
      setStep,
      onNextStep,
      onCancel,
      onSubmit,
    },
    ref
  ) => {
    const [yamlMode, setYamlMode] = useState(false);
    const fieldsArray = useMemo(() => {
      return schemas.map((s) => getFields(s));
    }, [schemas]);
    const kit = useContext(KitContext);
    // wizard
    const { layout, title } = uiConfig;
    const summaryInfo = useSummary(layout, values);

    function getComponent(f: TransformedField) {
      const [indexStr, path] = f.path.split(/\.(.*)/s);
      const index = parseInt(indexStr, 10);
      const { spec } = fieldsArray?.[index]?.[path] || {};

      const component = (
        <SpecField
          key={f.dataPath || f.key}
          field={f}
          widget={f.widget}
          widgetOptions={f.widgetOptions}
          spec={{ ...spec, title: f.label }}
          level={0}
          path={f.dataPath}
          stepElsRef={{}}
          value={f.value}
          slot={getSlot}
          onChange={(newValue: any, key?: string) => {
            const valuesSlice = [...values];
            set(valuesSlice, f.dataPath, newValue);
            onChange(valuesSlice, key);
          }}
        />
      );

      return {
        component,
      };
    }

    function renderFields() {
      const { layout, cancelText, confirmText } = uiConfig;
      switch (layout.type) {
        case "simple": {
          return (
            <div className={cx(WizardStyle)}>
              <div className={cx(dCss`width: 100%;`, WizardBodyStyle)}>
                <div className="left"></div>
                <Row gutter={[24, 16]} className="middle">
                  {transformFields(layout.fields, values, defaultValues).map((f) => {
                    const { component } = getComponent(f);
                    return component;
                  })}
                </Row>
                <div className="right">
                  {uiConfig.isDisplaySummary ? (
                    <SummaryList
                      title={uiConfig.title || ""}
                      groups={summaryInfo?.groups || []}
                      items={summaryInfo.items || []}
                    ></SummaryList>
                  ) : null}
                </div>
              </div>
              {uiConfig.isDisplayFooter ? (
                <div className={WizardFooterStyle}>
                  <div className="footer-content">
                    <div className="wizard-footer-left">
                      {error ? (
                        <Popover content={errorDetail || error}>
                          <div className="wizard-error">
                            <Icon
                              className="wizard-error-icon"
                              type="1-exclamation-error-circle-fill-16-red"
                            ></Icon>
                            <span className="wizard-error-text">{error}</span>
                          </div>
                        </Popover>
                      ) : null}
                    </div>
                    <div className="wizard-footer-btn-group">
                      <kit.Button
                        type={`quiet` as unknown as ButtonType}
                        onClick={() => {
                          onCancel?.();
                        }}
                      >
                        {cancelText}
                      </kit.Button>
                      <kit.Button
                        type="primary"
                        onClick={() => {
                          onSubmit?.(values);
                        }}
                        loading={submitting}
                      >
                        {confirmText || "next"}
                      </kit.Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        }
        case "tabs": {
          return (
            <Tabs isLazy>
              <TabList>
                {layout.tabs.map((t, idx) => {
                  return <Tab key={t.title + idx}>{t.title}</Tab>;
                })}
              </TabList>
              <TabPanels>
                {layout.tabs.map((t, idx) => {
                  return (
                    <TabPanel key={t.title + idx}>
                      {transformFields(t.fields, values, defaultValues).map((f) => {
                        const { component } = getComponent(f);
                        return component;
                      })}
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          );
        }
        case "wizard": {
          const currentStep = layout.steps[step];

          return (
            <div className={cx(WizardStyle)}>
              <div className={cx(dCss`width: 100%;`, WizardBodyStyle)}>
                <div className="left">
                  <Steps
                    style={{ minWidth: 192 }}
                    current={step}
                    onChange={(value) => {
                      setStep(value);
                    }}
                    direction="vertical"
                  >
                    {(layout.steps || []).map((s, idx) => (
                      <Steps.Step
                        key={s.title + idx}
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
                          s.disabled || idx > step
                          // (wizard?.disablePrevStep && idx !== step)
                        }
                      />
                    ))}
                  </Steps>
                </div>
                <Row gutter={[24, 16]} className="middle">
                  {transformFields(layout.steps[step].fields, values, defaultValues).map(
                    (f) => {
                      const { component } = getComponent(f);

                      return component;
                    }
                  )}
                </Row>
                <div className="right">
                  {uiConfig.isDisplaySummary ? (
                    <SummaryList
                      title={uiConfig.title || ""}
                      groups={summaryInfo?.groups}
                    ></SummaryList>
                  ) : null}
                </div>
              </div>
              {uiConfig.isDisplayFooter ? (
                <div className={WizardFooterStyle}>
                  <div className="footer-content">
                    <div className="wizard-footer-left">
                      {step !== 0 && (
                        <span
                          className="prev-step"
                          onClick={() => {
                            setStep(step - 1);
                          }}
                        >
                          {currentStep?.prevText || "previous"}
                        </span>
                      )}
                      {error ? (
                        <Popover content={errorDetail || error}>
                          <div className="wizard-error">
                            <Icon
                              className="wizard-error-icon"
                              type="1-exclamation-error-circle-fill-16-red"
                            ></Icon>
                            <span className="wizard-error-text">{error}</span>
                          </div>
                        </Popover>
                      ) : null}
                    </div>
                    <div className="wizard-footer-btn-group">
                      <kit.Button
                        type={`quiet` as unknown as ButtonType}
                        onClick={() => {
                          onCancel?.();
                        }}
                      >
                        {cancelText}
                      </kit.Button>
                      <kit.Button
                        type="primary"
                        onClick={() => {
                          if (step === layout.steps.length - 1) {
                            onSubmit?.(values);
                          } else {
                            onNextStep?.(values);
                          }
                        }}
                        loading={submitting}
                      >
                        {currentStep?.nextText || "next"}
                      </kit.Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        }
        default:
          return null;
      }
    }

    return (
      <div ref={ref} className={cx(className, KubectlApplyFormStyle)}>
        {title && (
          <div
            className={cx(
              WizardBodyStyle,
              dCss`width: 100%; flex: initial !important;`
            )}
          >
            <div className="left"></div>
            <div className="middle">
              <div className={Typo.Display.d1_bold_title}>{title}</div>
            </div>
            <div className="right"></div>
          </div>
        )}
        {uiConfig.allowToggleYaml && (
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            mb="2"
          >
            <FormLabel htmlFor="mode" mb="0" fontSize="sm">
              yaml
            </FormLabel>
            <Switch
              id="mode"
              checked={yamlMode}
              onChange={(evt) => setYamlMode(evt.currentTarget.checked)}
            />
          </FormControl>
        )}
        {yamlMode && (
          <CodeEditor
            defaultValue={values
              .map((v) => dump(v, { noRefs: true }))
              .join("---\n")}
            onBlur={(newValue) => {
              onChange(yaml.loadAll(newValue));
            }}
            language="yaml"
          />
        )}
        <div className={cx(yamlMode && dCss`display: none;`, FormWrapperStyle)}>
          {renderFields()}
        </div>
      </div>
    );
  }
);

export default KubectlApplyForm;
