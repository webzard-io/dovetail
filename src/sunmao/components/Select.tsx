import React, { useEffect, useState } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css as ecss } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { Select as BaseSelect } from "antd";

const SelectProps = Type.Object({
  defaultValue: Type.String(),
  options: Type.Array(
    Type.Object({
      text: Type.String(),
      value: Type.Any(),
    })
  ),
  disabled: Type.Boolean(),
});

const SelectState = Type.Object({
  value: Type.Any(),
  selectedOption: Type.Any(),
});

export const Select = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "select",
    displayName: "Select",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      options: [
        {
          text: "option 1",
          value: 1,
        },
        {
          text: "option 2",
          value: "2",
        },
      ],
    },
    exampleSize: [1, 2],
    annotations: {
      category: "Input",
    },
  },
  spec: {
    properties: SelectProps,
    state: SelectState,
    methods: {
      setValue: Type.Any(),
    },
    slots: {},
    styleSlots: ["select"],
    events: ["onChange"],
  },
})(
  ({
    component,
    callbackMap,
    customStyle,
    elementRef,
    options,
    defaultValue,
    disabled,
    mergeState,
    subscribeMethods,
  }) => {
    const [value, setValue] = useState<string>(defaultValue);
    useEffect(() => {
      mergeState({
        value,
      });
    }, [value, mergeState]);
    useEffect(() => {
      subscribeMethods({
        setValue,
      });
    }, [subscribeMethods]);

    return (
      <BaseSelect
        // ref={elementRef}
        className={ecss`
          ${customStyle?.select}
        `}
        value={value}
        onChange={(newV: string, option) => {
          setValue(newV);
          mergeState({
            value: newV,
            selectedOption: option,
          });
          callbackMap?.onChange?.();
        }}
        disabled={disabled}
        showSearch
        optionFilterProp="children"
      >
        {options.map((o) => {
          return (
            <BaseSelect.Option key={o.value} value={o.value}>
              {o.text}
            </BaseSelect.Option>
          );
        })}
      </BaseSelect>
    );
  }
);
