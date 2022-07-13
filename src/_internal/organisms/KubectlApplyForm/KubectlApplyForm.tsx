import { JSONSchema7 } from "json-schema";
import React, { useMemo, useState } from "react";
import _ from "lodash";
import { getFields } from "../../molecules/AutoForm/get-fields";
import CodeEditor from "../../atoms/CodeEditor";
import yaml, { dump } from "js-yaml";
import { WizardBodyStyle, WizardStyle } from "../UnstructuredForm";
import { cx, css as dCss } from "@emotion/css";
import { Steps, Row, Col } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  FormItem,
  HasMargin,
  FormLabel as FormLabelStyle,
  FieldSection,
  FormErrorMessage,
  FormHelperText,
} from "../../molecules/AutoForm/SpecField";
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

export type Field = {
  path: string;
  label: string;
  helperText: string;
  sectionTitle: string;
  error: string;
  widget: string;
};

type Layout =
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
  k8sConfig: {
    basePath: string;
  };
  applyConfig: {
    create?: boolean;
    patch?: boolean;
  };
  schemas: JSONSchema7[];
  uiConfig: {
    layout: Layout;
  };
  values: any[];
  onChange: (values: any[]) => void;
  getSlot?: (f: Field, fallback: React.ReactNode) => React.ReactNode;
};

const FieldWrapper: React.FC<
  Field & {
    children?: React.ReactNode;
  }
> = (props) => {
  const { label, children, sectionTitle, helperText, error } = props;
  const displayLabel = Boolean(label);

  return (
    <Row className={cx(FormItem, displayLabel && HasMargin)}>
      {sectionTitle && <div className={FieldSection}>{sectionTitle}</div>}
      {displayLabel && (
        <Col span="6" className={FormLabelStyle}>
          {label}
        </Col>
      )}
      <Col span={displayLabel ? 18 : 24}>
        {children}
        {error && <div className={FormErrorMessage}>{error}</div>}
        {helperText && <div className={FormHelperText}>{helperText}</div>}
      </Col>
    </Row>
  );
};

const KubectlApplyForm = React.forwardRef<
  HTMLDivElement,
  KubectlApplyFormProps
>(({ schemas = [], uiConfig, values, onChange, getSlot }, ref) => {
  const [yamlMode, setYamlMode] = useState(false);
  const fieldsArray = useMemo(() => {
    return schemas.map((s) => getFields(s));
  }, [schemas]);
  // wizard
  const [step, setStep] = useState(0);

  function getDataPath(f: Field) {
    const [indexStr] = f.path.split(/\.(.*)/s);
    const index = parseInt(indexStr, 10);
    return f.path.endsWith(".*") ? index : f.path;
  }

  function getComponent(f: Field) {
    const [indexStr, path] = f.path.split(/\.(.*)/s);
    const index = parseInt(indexStr, 10);
    const { Component, spec } = fieldsArray[index][`.${path}`];
    const value = _.get(values, getDataPath(f));
    const slotElement = getSlot?.(
      f,
      <Component
        key={f.path}
        widget={f.widget}
        spec={spec}
        level={0}
        path=""
        stepElsRef={{}}
        value={value}
        onChange={(newValue) => {
          const valuesSlice = [...values];
          _.set(valuesSlice, getDataPath(f), newValue);
          onChange(valuesSlice);
        }}
      />
    );
    return {
      component: slotElement,
    };
  }

  function renderFields() {
    const { layout } = uiConfig;
    switch (layout.type) {
      case "simple": {
        return (
          <>
            {layout.fields.map((f) => {
              const { component } = getComponent(f);
              return (
                <FieldWrapper key={f.path} {...f}>
                  {component}
                </FieldWrapper>
              );
            })}
          </>
        );
      }
      case "tabs": {
        return (
          <Tabs isLazy>
            <TabList>
              {layout.tabs.map((t, idx) => {
                return <Tab key={idx}>{t.title}</Tab>;
              })}
            </TabList>
            <TabPanels>
              {layout.tabs.map((t, idx) => {
                return (
                  <TabPanel key={idx}>
                    {t.fields.map((f) => {
                      const { component } = getComponent(f);
                      return (
                        <FieldWrapper key={f.path} {...f}>
                          {component}
                        </FieldWrapper>
                      );
                    })}
                  </TabPanel>
                );
              })}
            </TabPanels>
          </Tabs>
        );
      }
      case "wizard": {
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
                        s.disabled || idx > step
                        // (wizard?.disablePrevStep && idx !== step)
                      }
                    />
                  ))}
                </Steps>
              </div>
              <div className="middle">
                {layout.steps[step].fields.map((f) => {
                  const { component } = getComponent(f);
                  return (
                    <FieldWrapper key={f.path} {...f}>
                      {component}
                    </FieldWrapper>
                  );
                })}
              </div>
              <div className="right"></div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <div ref={ref}>
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
        <div className={cx(yamlMode && dCss`display: none;`)}>
          {renderFields()}
        </div>
      }
    </div>
  );
});

export default KubectlApplyForm;
