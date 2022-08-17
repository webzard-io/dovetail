import React, { useCallback, useState, useMemo } from "react";
import { Input, FormControl, FormLabel } from "@chakra-ui/react";
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

const CustomComponentWidgetOptionsSpec = Type.Object({
  keyOfPath: Type.String(),
  slot: Type.String(),
});

const CustomComponentWidget = implementWidget<"kui/v1/CustomComponentWidget">({
  version: "kui/v1",
  metadata: {
    name: "CustomComponentWidget",
  },
  spec: {
    options: CustomComponentWidgetOptionsSpec,
  },
})(
  observer(({ services, component, value, path, level, spec, onChange }) => {
    const { registry, editorStore, appModelManager } = services;
    const keyOfPath = spec.widgetOptions?.keyOfPath || "path";
    const slot = spec.widgetOptions?.slot || "content";
    const fieldPath = useMemo(
      () =>
        get(
          component.properties,
          path
            .slice(0, path.length - 1)
            .concat([keyOfPath])
            .join(".")
        ),
      [path, component]
    );
    const inputComponent = useMemo(
      () =>
        value ? editorStore.components.find(({ id }) => id === value) : null,
      [editorStore.components, value]
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
        const operations: Parameters<typeof appModelManager.doOperations>[0] = [
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
                  slot,
                },
                ifCondition: `{{ $slot['${keyOfPath}'] === '${fieldPath}' }}`,
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
      </div>
    );
  })
);

export default CustomComponentWidget;
