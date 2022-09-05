import React, { useCallback, useState, useMemo } from "react";
import {
  Select as ChakraSelect,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { implementWidget, ExpressionWidget } from "@sunmao-ui/editor-sdk";
import { Type } from "@sinclair/typebox";
import { last, get } from "lodash";
import { observer } from "mobx-react-lite";
import { css } from "@emotion/css";

const FormItemStyle = css`
  &.chakra-form-control {
    margin-bottom: var(--chakra-space-2);
  }
`;

const LabelStyle = css`
  &.chakra-form__label {
    font-weight: normal;
    font-size: 14px;
  }
`;

const FieldCustomComponentWidgetOptionsSpec = Type.Object({
  parentPath: Type.String(),
});

const FieldCustomComponentWidget =
  implementWidget<"kui/v1/FieldCustomComponentWidget">({
    version: "kui/v1",
    metadata: {
      name: "FieldCustomComponentWidget",
    },
    spec: {
      options: FieldCustomComponentWidgetOptionsSpec,
    },
  })(
    observer(({ spec, services, component, value, path, level, onChange }) => {
      const parentPath = spec.widgetOptions?.parentPath || "";
      const { registry, editorStore, appModelManager } = services;
      const fieldPath = useMemo(
        () =>
          get(
            component.properties,
            path
              .slice(0, path.length - 1)
              .concat(["path"])
              .join(".")
          ),
        [path, component]
      );
      const inputComponent = useMemo(
        () =>
          value ? editorStore.components.find(({ id }) => id === value) : null,
        [editorStore.components, value]
      );
      const syncTraitIndex = useMemo(
        () =>
          inputComponent
            ? inputComponent.traits.findIndex(
                ({ type }) => type === "kui/v1/sync_kubectl_apply_form"
              )
            : -1,
        [inputComponent]
      );
      const syncTrait = useMemo(
        () =>
          syncTraitIndex !== -1 ? inputComponent?.traits[syncTraitIndex] : null,
        [syncTraitIndex, inputComponent]
      );
      const componentTypes = useMemo(
        () =>
          registry
            .getAllComponents()
            .map(({ version, metadata }) => `${version}/${metadata.name}`),
        [registry]
      );
      const [type, setType] = useState<string>(
        inputComponent ? inputComponent.type || "" : ""
      );
      const inputComponentMethods = useMemo(
        () => (type ? registry.getComponentByType(type).spec.methods : {}),
        [registry, type]
      );

      const onTypeChange = useCallback(
        (item) => {
          const newType = item?.value;
          const newComponentId = `${component.id}_${last(
            newType.split("/")
          )}_${String(Date.now()).slice(-6)}`;
          const operations: Parameters<typeof appModelManager.doOperations>[0] =
            [
              {
                type: "createComponent" as const,
                props: {
                  componentId: newComponentId,
                  componentType: newType,
                  parentId: component.id,
                  slot: "field",
                },
              },
              {
                type: "modifyTraitProperty" as const,
                props: {
                  componentId: newComponentId,
                  traitIndex: 0,
                  properties: {
                    container: {
                      id: component.id,
                      slot: "field",
                    },
                    ifCondition: `{{ $slot.path === '${fieldPath}' }}`,
                  },
                },
              },
              {
                type: "createTrait" as const,
                props: {
                  componentId: newComponentId,
                  traitType: "core/v1/event",
                  properties: {
                    handlers: [
                      {
                        type: "onChange",
                        componentId: component.id,
                        method: {
                          name: "setField",
                          parameters: {
                            fieldPath: parentPath
                              ? `${parentPath}.${fieldPath}`
                              : fieldPath,
                            value: `{{${newComponentId}.value}}`,
                          },
                        },
                        wait: {
                          type: "debounce",
                          time: 0,
                        },
                        disabled: false,
                      },
                    ],
                  },
                },
              },
              {
                type: "createTrait" as const,
                props: {
                  componentId: newComponentId,
                  traitType: "kui/v1/sync_kubectl_apply_form",
                  properties: {
                    formValue: `{{ ${component.id}.value${
                      parentPath ? `['${parentPath}']` : ""
                    }${(fieldPath as string)
                      .split(".")
                      .map((key) => `['${key}']`)
                      .join("")} }}`,
                    setValueMethod: "setValue",
                    formId: component.id,
                    fieldPath: parentPath
                      ? `${parentPath}.${fieldPath}`
                      : fieldPath,
                  },
                },
              },
            ];

          if (value) {
            // if this filed already has the custom widget, then remove it first
            operations.unshift({
              type: "removeComponent" as const,
              props: {
                componentId: value,
              },
            });
          }

          appModelManager.doOperations(operations);
          setType(newType);
          onChange(newComponentId);
        },
        [appModelManager, onChange, value]
      );
      const onTraitValueChange = useCallback(
        (traitValue: string) => {
          if (syncTrait) {
            appModelManager.doOperations([
              {
                type: "modifyTraitProperty",
                props: {
                  componentId: value,
                  traitIndex: syncTraitIndex,
                  properties: {
                    value: traitValue,
                  },
                },
              },
            ]);
          }
        },
        [appModelManager, syncTrait, syncTraitIndex, value]
      );
      const onTraitSetValueChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
          const traitSetValue = event.target.value;

          if (syncTrait) {
            appModelManager.doOperations([
              {
                type: "modifyTraitProperty",
                props: {
                  componentId: value,
                  traitIndex: syncTraitIndex,
                  properties: {
                    setValueMethod: traitSetValue,
                  },
                },
              },
            ]);
          }
        },
        [appModelManager, syncTrait, syncTraitIndex, value]
      );

      return (
        <div>
          <FormControl className={FormItemStyle}>
            <FormLabel className={LabelStyle}>Component Type</FormLabel>
            <Select
              value={{ label: type, value: type }}
              options={componentTypes.map((type) => ({
                label: type,
                value: type,
              }))}
              onChange={onTypeChange}
            ></Select>
          </FormControl>
          {type ? (
            <FormControl className={FormItemStyle}>
              <FormLabel className={LabelStyle}>Component ID</FormLabel>
              <Input value={value} disabled></Input>
            </FormControl>
          ) : null}
          {syncTrait ? (
            <>
              <FormControl className={FormItemStyle}>
                <FormLabel className={LabelStyle}>From item value</FormLabel>
                <ExpressionWidget
                  value={syncTrait.properties.value}
                  component={component}
                  spec={Type.String()}
                  level={level + 1}
                  path={[]}
                  services={services}
                  onChange={onTraitValueChange}
                ></ExpressionWidget>
              </FormControl>
              <FormControl className={FormItemStyle}>
                <FormLabel className={LabelStyle}>
                  Form item setValue method
                </FormLabel>
                <ChakraSelect
                  value={syncTrait.properties.setValueMethod as string}
                  onChange={onTraitSetValueChange}
                >
                  {[""]
                    .concat(Object.keys(inputComponentMethods))
                    .map((key) => (
                      <option value={key} key={key}>
                        {key}
                      </option>
                    ))}
                </ChakraSelect>
              </FormControl>
            </>
          ) : null}
        </div>
      );
    })
  );

export default FieldCustomComponentWidget;
