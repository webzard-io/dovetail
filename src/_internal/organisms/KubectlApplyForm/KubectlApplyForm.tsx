import { JSONSchema7 } from "json-schema";
import React, { useContext, useMemo, useState, useRef } from "react";
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
import { Steps, Popover, Row, Alert } from "antd";
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
import {
  Field,
  TransformedField,
  Layout,
  Services,
  Events,
  Store,
} from "./type";
import { transformFields } from "./utils";
import mitt from "mitt";

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
  displayValues: Record<string, any>;
  error?: string;
  errorDetail?: {
    title: string;
    errors: string[];
  };
  submitting?: boolean;
  step: number;
  setStep: (step: number) => void;
  getSlot?: (
    f: Field & { index?: number },
    fallback: React.ReactNode,
    slotKey: string
  ) => React.ReactNode;
  getHelperSlot?: (
    f: Field & { index?: number },
    fallback: React.ReactNode,
    slotKey: string
  ) => React.ReactNode;
  onChange: (
    values: any[],
    displayValues: Record<string, any>,
    key?: string,
    dataPath?: string
  ) => void;
  onDisplayValuesChange: (displayValues: Record<string, any>) => void;
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
      basePath,
      className,
      schemas = [],
      uiConfig,
      values,
      defaultValues,
      displayValues,
      error,
      errorDetail,
      submitting,
      onChange,
      onDisplayValuesChange,
      getSlot,
      getHelperSlot,
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
    const [store, setStore] = useState<Store>({
      summary: {
        removableMap: {},
      },
    });
    const eventRef = useRef(mitt<Events>());
    const services = useMemo<Services>(() => {
      return {
        event: eventRef.current,
        store,
        setStore,
      };
    }, [store, setStore]);
    const summaryInfo = useSummary(layout, values, displayValues, services);

    function getComponent(f: TransformedField) {
      const [indexStr, path] = f.path.split(/\.(.*)/s);
      const index = parseInt(indexStr, 10);
      const { spec } = fieldsArray?.[index]?.[path] || {};

      const component = (
        <SpecField
          services={services}
          key={f.dataPath || f.key}
          basePath={basePath}
          field={f}
          error={f.error}
          widget={f.widget}
          widgetOptions={f.widgetOptions}
          spec={{ ...spec, title: f.label }}
          fieldsArray={fieldsArray}
          level={0}
          path={f.dataPath}
          stepElsRef={{}}
          value={f.value}
          displayValues={displayValues}
          slot={getSlot}
          helperSlot={getHelperSlot}
          onChange={(
            newValue: any,
            displayValue: any,
            key?: string,
            dataPath?: string
          ) => {
            const valuesSlice = [...values];
            set(valuesSlice, f.dataPath, newValue);
            onChange(valuesSlice, displayValue, key, dataPath);
          }}
          onDisplayValuesChange={(displayValues: Record<string, any>) => {
            onDisplayValuesChange(displayValues);
          }}
        />
      );

      return {
        component,
      };
    }

    const errorContent =
      error && errorDetail?.errors?.length ? (
        <Alert
          type="error"
          className="error-alert"
          message={
            <>
              <div className={cx(Typo.Label.l4_regular, "error-alert-title")}>
                {errorDetail.title}
              </div>
              {errorDetail.errors.map((errorInfo, index) => (
                <div className={Typo.Label.l4_regular} key={errorInfo}>{`${
                  errorDetail.errors.length > 1 ? index + 1 + "." : ""
                } ${errorInfo}`}</div>
              ))}
            </>
          }
          showIcon
        ></Alert>
      ) : null;

    function renderFields() {
      const { layout, cancelText, confirmText } = uiConfig;
      switch (layout.type) {
        case "simple": {
          return (
            <div className={cx(WizardStyle)}>
              <div className={cx(dCss`width: 100%;`, WizardBodyStyle)}>
                <div className="left"></div>
                <Row gutter={[24, 16]} className="middle">
                  <div className="middle-form-wrapper">
                    {transformFields(layout.fields, values, defaultValues).map(
                      (f) => {
                        const { component } = getComponent(f);
                        return component;
                      }
                    )}
                  </div>
                  {errorContent}
                </Row>
                <div className="right">
                  {uiConfig.isDisplaySummary ? (
                    <SummaryList
                      title={uiConfig.title || ""}
                      groups={summaryInfo?.groups || []}
                      items={summaryInfo.items || []}
                      services={services}
                    ></SummaryList>
                  ) : null}
                </div>
              </div>
              {uiConfig.isDisplayFooter ? (
                <div className={WizardFooterStyle}>
                  <div className="footer-content">
                    <div className="wizard-footer-left">
                      {error ? (
                        <div className="wizard-error">
                          <Icon
                            className="wizard-error-icon"
                            type="1-exclamation-error-circle-fill-16-red"
                          ></Icon>
                          <span className="wizard-error-text">{error}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="wizard-footer-btn-group">
                      <kit.Button
                        type={"quiet" as unknown as ButtonType}
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
                      {transformFields(t.fields, values, defaultValues).map(
                        (f) => {
                          const { component } = getComponent(f);
                          return component;
                        }
                      )}
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
                  <div className="middle-form-wrapper">
                    {transformFields(
                      layout.steps[step].fields,
                      values,
                      defaultValues
                    ).map((f) => {
                      const { component } = getComponent(f);

                      return component;
                    })}
                  </div>
                  {errorContent}
                </Row>
                <div className="right">
                  {uiConfig.isDisplaySummary ? (
                    <SummaryList
                      title={uiConfig.title || ""}
                      groups={summaryInfo?.groups}
                      services={services}
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
                        <div className="wizard-error">
                          <Icon
                            className="wizard-error-icon"
                            type="1-exclamation-error-circle-fill-16-red"
                          ></Icon>
                          <span className="wizard-error-text">{error}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="wizard-footer-btn-group">
                      <kit.Button
                        type={"quiet" as unknown as ButtonType}
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
            <div className={cx("middle", dCss`margin-bottom: 40px`)}>
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
              onChange(yaml.loadAll(newValue), displayValues);
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
