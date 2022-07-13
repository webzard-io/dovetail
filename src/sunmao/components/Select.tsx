import { useEffect, useState } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import { Select as BaseSelect } from "antd";

const SelectProps = Type.Object({
  defaultValue: Type.Any(),
  options: Type.Array(
    Type.Object({
      text: Type.String(),
      value: Type.Any(),
    })
  ),
});

const SelectState = Type.Object({
  value: Type.Any(),
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
    mergeState,
    subscribeMethods,
  }) => {
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
      mergeState({
        value,
      });
    }, [value]);
    useEffect(() => {
      subscribeMethods({
        setValue,
      });
    }, []);

    return (
      <BaseSelect
        // ref={elementRef}
        className={css`
          ${customStyle?.select}
        `}
        value={value}
        onChange={(newV) => {
          setValue(newV);
          callbackMap?.onChange();
        }}
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
