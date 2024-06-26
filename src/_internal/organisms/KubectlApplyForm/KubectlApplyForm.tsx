import { JSONSchema7 } from "json-schema";
import React, {
  useContext,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
} from "react";
import set from "lodash/set";
import { getFields } from "../../molecules/AutoForm/get-fields";
import CodeEditor from "../../atoms/CodeEditor";
import yaml, { dump } from "js-yaml";
import {
  KubectlApplyFormStyle,
  FormWrapperStyle,
  WizardBodyWrapperStyle,
  WizardBodyStyle,
  WizardFooterStyle,
  WizardStyle,
  DescriptionStyle
} from "./KubectlApplyForm.style";
import { cx, css as dCss } from "@emotion/css";
import { Steps, Row, Alert, Col } from "antd";
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
  FormItemData,
} from "./type";
import { transformFields } from "./utils";
import mitt from "mitt";
import { immutableSet } from "../../../sunmao/utils/object";

export const CUSTOM_SCHEMA_KIND = "x-dovetail-custom-kind";

export type KubectlApplyFormRef = {
  validate: () => Record<string, string[]>;
  getElementRef: () => React.RefObject<HTMLDivElement>;
};

export type KubectlApplyFormProps = {
  className?: string;
  basePath: string;
  schemas: JSONSchema7[];
  uiConfig: {
    allowToggleYaml: boolean;
    isDisplaySummary?: boolean;
    isDisplayFooter?: boolean;
    title?: string;
    titleGap?: string;
    description?: string;
    layout: Layout;
    confirmText: string;
    cancelText: string;
  };
  values: unknown[];
  defaultValues: unknown[];
  displayValues: Record<string, unknown>;
  error?: string;
  errorDetail?: {
    title: string;
    errors: string[];
  };
  submitting?: boolean;
  step: number;
  enabledEditorMap: Record<string, boolean>;
  setEnabledEditorMap: (newMap: Record<string, boolean>) => void;
  setStep: (step: number) => void;
  getSlot?: (
    field: FormItemData,
    fallback: React.ReactNode,
    slotKey: string
  ) => React.ReactNode;
  getHelperSlot?: (
    field: FormItemData,
    fallback: React.ReactNode,
    slotKey: string
  ) => React.ReactNode;
  getLabelSlot?: (
    field: FormItemData,
    fallback: React.ReactNode,
    slotKey: string
  ) => React.ReactNode;
  onChange: (
    values: unknown[],
    displayValues: Record<string, unknown>,
    key?: string,
    dataPath?: string
  ) => void;
  onDisplayValuesChange: (displayValues: Record<string, unknown>) => void;
  onNextStep?: (values: unknown[]) => void;
  onSubmit?: (values: unknown[]) => void;
  onCancel?: () => void;
};

const KubectlApplyForm = React.forwardRef<
  KubectlApplyFormRef,
  KubectlApplyFormProps
>(
  function KubectlApplyForm(
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
      step,
      enabledEditorMap,
      setEnabledEditorMap,
      getSlot,
      getHelperSlot,
      getLabelSlot,
      setStep,
      onChange,
      onDisplayValuesChange,
      onNextStep,
      onCancel,
      onSubmit,
    },
    ref
  ) {
    const elementRef = useRef(null);
    const [yamlMode, setYamlMode] = useState(false);
    const specsArray = useMemo(() => {
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
      const { spec } = specsArray?.[index]?.[path] || {};
      const isLayout = f.type === "layout";

      const component = (
        <SpecField
          key={f.dataPath || f.key}
          services={services}
          basePath={basePath}
          field={f}
          itemKey={f.key || ""}
          error={f.error}
          widget={f.widget}
          widgetOptions={f.widgetOptions}
          spec={spec || {}}
          specsArray={specsArray}
          level={0}
          path={f.dataPath}
          value={isLayout ? values : f.value}
          displayValues={displayValues}
          slot={getSlot}
          helperSlot={getHelperSlot}
          labelSlot={getLabelSlot}
          enabledEditorMap={enabledEditorMap}
          setEnabledEditorMap={setEnabledEditorMap}
          onChange={(
            newValue: unknown,
            displayValue: Record<string, unknown>,
            key?: string,
            dataPath?: string
          ) => {
            onChange(immutableSet(values, isLayout ? dataPath || "" : f.dataPath, newValue) as unknown[], displayValue, key, dataPath);
          }}
          onDisplayValuesChange={(displayValues: Record<string, unknown>) => {
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
                <div className={Typo.Label.l4_regular} key={errorInfo}>{`${errorDetail.errors.length > 1 ? `${index + 1}.` : ""
                  } ${errorInfo}`}</div>
              ))}
            </>
          }
          showIcon
        ></Alert>
      ) : null;
    const titleGap = `margin-bottom: ${uiConfig.titleGap || "40px"};`;

    function renderFields() {
      const { layout, cancelText, confirmText } = uiConfig;
      const descriptionEl = uiConfig.description ? (
        <Col>
          <div className={cx(DescriptionStyle, Typo.Label.l2_regular)}>{uiConfig.description}</div>
        </Col>
      ) : null;

      switch (layout.type) {
        case "simple": {
          return (
            <div className={cx(WizardStyle)}>
              <div className={cx(WizardBodyWrapperStyle, "body-wrapper")}>
                <div className={cx(dCss`width: 100%;`, WizardBodyStyle)}>
                  <div className="left"></div>
                  <Row gutter={[24, 16]} className={cx("middle", dCss`${titleGap}`)}>
                    <div className="middle-form-wrapper">
                      {descriptionEl}
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
              </div>
              {uiConfig.isDisplayFooter ? (
                <div className={cx(WizardFooterStyle, "footer-wrapper")}>
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
            <>
              <Tabs isLazy>
                <TabList>
                  {layout.tabs.map((t, idx) => {
                    return <Tab key={`${t.title}-${idx}`}>{t.title}</Tab>;
                  })}
                </TabList>
                <TabPanels>
                  {layout.tabs.map((t, idx) => {
                    return (
                      <TabPanel key={`${t.title}-${idx}`}>
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
            </>
          );
        }
        case "wizard": {
          const currentStep = layout.steps[step];

          return (
            <div className={cx(WizardStyle)}>
              <div className={cx(WizardBodyWrapperStyle, "body-wrapper")}>
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
                          key={`${s.title}-${idx}`}
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
                  <Row gutter={[24, 16]} className={cx("middle", dCss`${titleGap}`)}>
                    <div className="middle-form-wrapper">
                      {descriptionEl}
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
              </div>
              {uiConfig.isDisplayFooter ? (
                <div className={cx(WizardFooterStyle, "footer-wrapper")}>
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

    useImperativeHandle(
      ref,
      () => ({
        validate() {
          const result = {};

          services.event.emit("validate", {
            result,
          });

          return result;
        },
        getElementRef() {
          return elementRef;
        },
      }),

      [services.event]
    );

    return (
      <div ref={elementRef} className={cx(className, KubectlApplyFormStyle)}>
        {title && (
          <div
            className={cx(
              WizardBodyStyle,
              dCss`width: 100%; flex: initial !important;`
            )}
          >
            <div className="left"></div>
            <div className={cx("middle", dCss`${titleGap}`)}>
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
