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
import { Steps, Popover } from "antd";
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

export type Field = {
  fields?: Field[];
  path: string;
  key?: string;
  label: string;
  layout: "horizontal" | "vertical";
  isDisplayLabel: boolean;
  helperText: string;
  sectionTitle: string;
  error: string;
  condition?: boolean;
  widget?: string;
  widgetOptions?: Record<string, any>;
  componentId?: string;
};

type TransformedField = Field & { dataPath: string; value: any };

export type Layout =
  | {
      type: "simple";
      fields: Field[];
    }
  | {
      type: "tabs";
      tabs: {
        title: string;
        fields: Field[];
      }[];
    }
  | {
      type: "wizard";
      steps: {
        title: string;
        fields: Field[];
        disabled?: boolean;
        prevText?: string;
        nextText?: string;
      }[];
    };

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
    title?: string;
    layout: Layout;
    confirmText: string;
    cancelText: string;
  };
  values: any[];
  error?: string;
  errorDetail?: string;
  getSlot?: (f: Field, fallback: React.ReactNode) => React.ReactNode;
  onChange: (values: any[], key?: string) => void;
  onSubmit?: (values: any[]) => void;
  onCancel?: () => void;
};

function getDataPath(p: string) {
  const [indexStr] = p.split(/\.(.*)/s);
  const index = parseInt(indexStr, 10);
  let dataPath = String(p.endsWith(".*") ? index : p);
  dataPath = dataPath.replace(/.\$add$/, "");
  return dataPath;
}

function iterateArrPath(
  p: string,
  values: any[],
  cb: (f: { itemDataPath: string; itemValue: any }) => void
) {
  const arrPathMatch = p.split(/\.\$i(.*)/s);
  if (arrPathMatch.length === 1) {
    const itemPath = arrPathMatch[0];
    const itemDataPath = getDataPath(itemPath);
    const itemValue = get(values, itemDataPath);
    cb({
      itemDataPath,
      itemValue,
    });
    return;
  }
  const [arrPath] = arrPathMatch;
  const value = get(values, getDataPath(arrPath));
  if (!Array.isArray(value)) {
    return;
  }
  value.forEach((__, idx) => {
    const nextP = p.replace("$i", String(idx));
    iterateArrPath(nextP, values, cb);
  });
}

function transformFields(fields: Field[], values: any[]): TransformedField[] {
  const newFields = [];
  for (const f of fields) {
    if (f.path.includes(".$i")) {
      iterateArrPath(f.path, values, ({ itemDataPath, itemValue }) => {
        newFields.push({
          ...f,
          dataPath: itemDataPath,
          value: itemValue,
        });
      });
    } else {
      const dataPath = getDataPath(f.path);
      newFields.push({
        ...f,
        dataPath,
        value: get(values, dataPath),
      });
    }
  }

  return heuristicGroupArray(newFields);
}

// magic heuristic infer array struct, we should be able to find better way
function heuristicGroupArray(fields: TransformedField[]): TransformedField[] {
  const newFields = [];

  const groupedByPrefix = groupBy(fields, (f) => {
    const arrPathMatch = f.path.split(/\.\$i(.*)/s);
    if (arrPathMatch.length === 1) {
      return arrPathMatch[0];
    }
    return arrPathMatch[0].concat(".$i");
  });

  for (const subFields of Object.values(groupedByPrefix)) {
    if (subFields.length === 1) {
      newFields.push(subFields[0]);
      continue;
    }
    const groupedByPath = groupBy(subFields, "path");
    const subSubFieldsArr = Object.values(groupedByPath);
    for (let idx = 0; idx < subSubFieldsArr[0].length; idx++) {
      for (const subSubFields of subSubFieldsArr) {
        newFields.push(subSubFields[idx]);
      }
    }
  }

  return newFields;
}

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
      error,
      errorDetail,
      onChange,
      getSlot,
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
    const [step, setStep] = useState(0);
    const { layout, cancelText } = uiConfig;
    const summaryInfo = useSummary(layout, values);

    function getComponent(f: TransformedField) {
      const [indexStr, path] = f.path.split(/\.(.*)/s);
      const index = parseInt(indexStr, 10);
      const { spec } = fieldsArray?.[index]?.[path] || {};

      const component = (
        <SpecField
          key={f.dataPath}
          field={f}
          widget={f.widget}
          widgetOptions={f.widgetOptions}
          spec={{ ...spec, title: f.label }}
          level={0}
          path=""
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
                <div className="middle">
                  {transformFields(layout.fields, values).map((f) => {
                    const { component } = getComponent(f);
                    return component;
                  })}
                </div>
                <div className="right">
                  <SummaryList
                    title={uiConfig.title || ""}
                    groups={summaryInfo?.groups || []}
                    items={summaryInfo.items || []}
                  ></SummaryList>
                </div>
              </div>
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
                    >
                      {confirmText || "next"}
                    </kit.Button>
                  </div>
                </div>
              </div>
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
                      {transformFields(t.fields, values).map((f) => {
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
                <div className="middle">
                  {transformFields(layout.steps[step].fields, values).map(
                    (f) => {
                      const { component } = getComponent(f);

                      return component;
                    }
                  )}
                </div>
                <div className="right">
                  <SummaryList
                    title={uiConfig.title || ""}
                    groups={summaryInfo?.groups}
                  ></SummaryList>
                </div>
              </div>
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
                          setStep(step + 1);
                        }
                      }}
                    >
                      {currentStep?.nextText || "next"}
                    </kit.Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        default:
          return null;
      }
    }

    return (
      <div ref={ref} className={cx(className, KubectlApplyFormStyle)}>
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
        {
          <div className={cx(yamlMode && dCss`display: none;`, FormWrapperStyle)}>
            {renderFields()}
          </div>
        }
      </div>
    );
  }
);

export default KubectlApplyForm;
