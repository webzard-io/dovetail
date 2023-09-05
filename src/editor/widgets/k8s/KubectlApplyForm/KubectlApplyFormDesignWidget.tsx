import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  implementWidget,
  WidgetProps,
  isExpression,
  SpecWidget,
} from "@sunmao-ui/editor-sdk";
import {
  ChakraProvider,
  extendTheme,
  Modal,
  useDisclosure,
  Box,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Step, Steps, useSteps, StepsStyleConfig } from "chakra-ui-steps";
import { css, injectGlobal } from "@emotion/css";
import JsonSchemaEditor from "@optum/json-schema-editor";
import { loadAll } from "js-yaml";
import MonacoEditor from "./MonacoEditor";
import { get, omit } from "lodash";
import type { KubectlApplyFormProps } from "src/_internal/organisms/KubectlApplyForm/KubectlApplyForm";
import { CUSTOM_SCHEMA_KIND } from "src/_internal/organisms/KubectlApplyForm/KubectlApplyForm";
import { Field } from "src/_internal/organisms/KubectlApplyForm/type";
import { getJsonSchemaByPath } from "src/_internal/utils/schema";
import { UiConfigSpec } from "src/sunmao/components/KubectlApplyForm";
import { mergeWidgetOptionsByPath } from "../../../utils/schema";
import { getFields } from "src/_internal/molecules/AutoForm/get-fields";
import store from "../store";
import useProperty from "../../../hooks/useProperty";

injectGlobal`
.chakra-popover__popper {
  z-index: 1401 !important;
}
`;

const theme = extendTheme({
  components: {
    Steps: StepsStyleConfig,
  },
});

const steps = [
  { label: "Input Yaml" },
  { label: "Edit Schemas" },
  { label: "Configure UI" },
];

type FormConfig = {
  yaml: string;
  schemas: KubectlApplyFormProps["schemas"];
  defaultValues: KubectlApplyFormProps["values"];
  uiConfig: KubectlApplyFormProps["uiConfig"];
};

function inferLayout(
  current: FormConfig["uiConfig"],
  next: FormConfig["uiConfig"]
): FormConfig["uiConfig"] {
  if (current.layout.type === next.layout.type) {
    return next;
  }
  let fields: Field[] = [];
  switch (current.layout.type) {
    case "simple":
      fields = current.layout.fields;
      break;
    case "tabs":
      fields = current.layout.tabs.reduce<Field[]>((prev, cur) => {
        return prev.concat(cur.fields);
      }, []);
      break;
    case "wizard":
      fields = current.layout.steps.reduce<Field[]>((prev, cur) => {
        return prev.concat(cur.fields);
      }, []);
      break;
    default:
  }
  switch (next.layout.type) {
    case "simple":
      return {
        ...next,
        layout: {
          type: "simple",
          fields,
        },
      };
    case "tabs":
      return {
        ...next,
        layout: {
          type: "tabs",
          tabs: [
            {
              title: "Tab 1",
              fields,
            },
          ],
        },
      };
    case "wizard":
      return {
        ...next,
        layout: {
          type: "wizard",
          steps: [
            {
              title: "Step 1",
              fields,
            },
          ],
        },
      };
    default:
      return next;
  }
}

function fieldsIsEmpty(uiConfig: FormConfig["uiConfig"]): boolean {
  switch (uiConfig.layout.type) {
    case "simple":
      return uiConfig.layout.fields.length === 0;
    case "tabs":
      return uiConfig.layout.tabs.every((t) => t.fields.length === 0);
    case "wizard":
      return uiConfig.layout.steps.every((t) => t.fields.length === 0);
    default:
      return true;
  }
}

const KubectlApplyFormDesignWidget: React.FC<
  WidgetProps<"kui/v1/KubectlApplyFormDesignWidget">
> = (props) => {
  const { component, value, services, onChange, path } = props;
  const formConfig = useRef<FormConfig>(
    isExpression(value) ? services.stateManager.deepEval(value) : value
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { nextStep, prevStep, activeStep, setStep } = useSteps({
    initialStep: 0,
  });
  const [yamlValue, setYamlValue] = useState(formConfig.current.yaml);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [jsonEditorMode, setJsonEditorMode] = useState(false);
  const [uiConfig, setUiConfig] = useState(formConfig.current.uiConfig);
  const [updater, setUpdater] = useState(1);
  const basePath = useProperty({
    services,
    component,
    path,
    key: "basePath",
  });

  const UIConfigSpec = useMemo(() => {
    const paths = formConfig.current.schemas
      .map((schema, index) =>
        Object.keys(getFields(schema)).map((path) => `${index}.${path}`)
      )
      .flat();
    let spec = getJsonSchemaByPath(props.spec, "uiConfig");

    if (spec) {
      spec =
        mergeWidgetOptionsByPath(spec, "layout.fields.$i.path", {
          paths,
        }) || spec;
      spec =
        mergeWidgetOptionsByPath(spec, "layout.tabs.$i.fields.$i.path", {
          paths,
        }) || spec;
      spec =
        mergeWidgetOptionsByPath(spec, "layout.steps.$i.fields.$i.path", {
          paths,
        }) || spec;
    }

    return spec || UiConfigSpec;
  }, [formConfig.current.schemas, props.spec, updater]);

  useEffect(() => {
    store.schemas = formConfig.current.schemas;
  }, []);

  // use updater to trigger update
  return (
    <ChakraProvider theme={theme}>
      <Box>
        <Button onClick={onOpen} size="sm" variant="outline" mb={1}>
          Form Designer
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="full"
          closeOnEsc={false}
          trapFocus={false}
        >
          <ModalOverlay />
          <ModalContent height="100%">
            <ModalHeader>
              <Steps
                activeStep={activeStep}
                onClickStep={(step) => {
                  setStep(step);
                  setUpdater(updater + 1);
                }}
                width="50%"
                margin="auto"
                size="sm"
                flex="0"
                mb="2"
              >
                {steps.map(({ label }) => (
                  <Step label={label} key={label}></Step>
                ))}
              </Steps>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody overflow="auto">
              {isOpen && (
                <Flex height="100%" direction="column">
                  <Box flex="1">
                    {activeStep === 0 && (
                      <MonacoEditor
                        defaultValue={yamlValue || "# copy k8s manifests"}
                        onChange={(newValue) => {
                          setYamlValue(newValue);
                          formConfig.current.yaml = newValue;
                        }}
                        language="yaml"
                        minimap={false}
                        className={css`
                          height: 100%;
                        `}
                      />
                    )}
                    {activeStep === 1 &&
                      (loadingSchema ? (
                        <Spinner />
                      ) : (
                        <Tabs
                          isLazy
                          height="full"
                          display="flex"
                          flexDirection="column"
                        >
                          <TabList>
                            {formConfig.current.schemas.map((s, idx) => {
                              const resource =
                                get(
                                  s,
                                  "x-kubernetes-group-version-kind[0].kind"
                                ) ||
                                get(s, `${CUSTOM_SCHEMA_KIND}[0].kind`) ||
                                `Resource ${idx + 1}`;
                              return <Tab key={idx}>{resource}</Tab>;
                            })}
                          </TabList>
                          <TabPanels flex="1">
                            {formConfig.current.schemas.map((s, idx) => {
                              return (
                                <TabPanel key={idx} height="100%">
                                  <FormControl
                                    display="flex"
                                    alignItems="center"
                                    mb="1"
                                  >
                                    <FormLabel htmlFor="mode" mb="0">
                                      JSON Schema Editor
                                    </FormLabel>
                                    <Switch
                                      id="mode"
                                      checked={jsonEditorMode}
                                      onChange={(evt) =>
                                        setJsonEditorMode(
                                          evt.currentTarget.checked
                                        )
                                      }
                                    />
                                  </FormControl>
                                  {jsonEditorMode ? (
                                    <JsonSchemaEditor
                                      data={s}
                                      onSchemaChange={(newValue) => {
                                        if (newValue === JSON.stringify(s)) {
                                          return;
                                        }
                                        formConfig.current.schemas[idx] =
                                          JSON.parse(newValue);
                                        store.schemas =
                                          formConfig.current.schemas;
                                      }}
                                    />
                                  ) : (
                                    <MonacoEditor
                                      defaultValue={JSON.stringify(s, null, 2)}
                                      onChange={(newValue) => {
                                        if (newValue === JSON.stringify(s)) {
                                          return;
                                        }
                                        formConfig.current.schemas[idx] =
                                          JSON.parse(newValue);
                                        store.schemas =
                                          formConfig.current.schemas;
                                      }}
                                      language="json"
                                      minimap={false}
                                      className={css`
                                        height: 100%;
                                      `}
                                    />
                                  )}
                                </TabPanel>
                              );
                            })}
                          </TabPanels>
                        </Tabs>
                      ))}
                    {activeStep === 2 && updater && (
                      // use the updater to trigger the updating for using latest schemas
                      <Box>
                        <SpecWidget
                          component={props.component}
                          services={props.services}
                          path={path.concat(["uiConfig"])}
                          level={0}
                          spec={UIConfigSpec}
                          value={uiConfig}
                          onChange={(_newValue) => {
                            const newValue = inferLayout(uiConfig, _newValue);
                            setUiConfig(newValue);
                            formConfig.current.uiConfig = newValue;
                            onChange(formConfig.current);
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter>
              <Flex width="100%" justify="flex-end">
                <Button
                  isDisabled={activeStep === 0}
                  mr={4}
                  onClick={prevStep}
                  size="sm"
                  variant="ghost"
                >
                  Prev
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      onChange(formConfig.current);
                      onClose();
                    }}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={async () => {
                      setUpdater(updater + 1);
                      nextStep();
                      if (activeStep === 0) {
                        // go to schema step
                        const resources = loadAll(yamlValue) as {
                          apiVersion: string;
                          kind: string;
                        }[];

                        formConfig.current.defaultValues = resources;
                        setLoadingSchema(true);

                        formConfig.current.schemas = (
                          await store.fetchResourcesSchemas(
                            basePath,
                            resources.map((resource) => ({
                              apiBase:
                                resource.apiVersion === "v1"
                                  ? `/api/${resource.apiVersion}`
                                  : `/apis/${resource.apiVersion}`,
                              kind: resource.kind,
                            }))
                          )
                        ).map((schema, index) =>
                          schema
                            ? omit(schema, ["properties.status"])
                            : formConfig.current.schemas[index] || {
                                type: "object",
                                properties: {},
                                [CUSTOM_SCHEMA_KIND]: [
                                  {
                                    kind: resources[index].kind,
                                  },
                                ],
                              }
                        );

                        if (fieldsIsEmpty(formConfig.current.uiConfig)) {
                          formConfig.current.uiConfig.layout = {
                            type: "simple",
                            fields: formConfig.current.schemas.map(
                              (__, idx) => {
                                return {
                                  path: `${idx}.*`,
                                  label: "",
                                  helperText: "",
                                  sectionTitle: "",
                                  widget: "",
                                  error: "",
                                  layout: "horizontal",
                                  isDisplayLabel: true,
                                };
                              }
                            ),
                          };
                        }
                        setLoadingSchema(false);
                      }
                      onChange(formConfig.current);
                    }}
                  >
                    Next
                  </Button>
                )}
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default implementWidget<"kui/v1/KubectlApplyFormDesignWidget">({
  version: "kui/v1",
  metadata: {
    name: "KubectlApplyFormDesignWidget",
  },
})(KubectlApplyFormDesignWidget);
