import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import React, { useContext, useEffect } from "react";
import { styled } from "@linaria/react";

const OptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .dovetail-ant-tag {
    border: 0;
  }
`;

export const OptionsSpec = Type.Object({
  options: Type.Array(
    Type.Object({
      label: Type.String(),
      value: Type.String(),
      disabled: Type.Optional(Type.Boolean()),
      tags: Type.Array(
        Type.Object({
          name: Type.String(),
          color: Type.String(),
        })
      ),
    })
  ),
  disabled: Type.Optional(Type.Boolean()),
});

type Props = WidgetProps<string | string[], Static<typeof OptionsSpec>>;

const Select = (props: Props) => {
  const kit = useContext(KitContext);
  const {
    value,
    onChange,
    onDisplayValuesChange,
    widgetOptions,
    displayValues,
    path,
  } = props;
  const { options = [], disabled } = widgetOptions || { options: [] };

  useEffect(() => {
    if (value) {
      const selectedOption = options.find((option) => option.value === value);

      if (selectedOption) {
        onDisplayValuesChange({
          ...displayValues,
          [path]: selectedOption.label,
        });
      }
    }
  }, []);

  return (
    <kit.Select
      disabled={disabled}
      value={(value || "") as any}
      onChange={(value, option) =>
        onChange(
          value,
          {
            ...displayValues,
            [path]: option.label,
          },
          props.itemKey,
          props.path
        )
      }
      showSearch
      optionLabelProp="label"
      optionFilterProp="children"
    >
      {options.map((option, idx) => {
        return (
          <AntdSelect.Option
            key={idx}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
          >
            <OptionWrapper>
              <span>{option.label}</span>
              {(option.tags || []).map((tag) => (
                <kit.Tag color={tag.color}>{tag.name}</kit.Tag>
              ))}
            </OptionWrapper>
          </AntdSelect.Option>
        );
      })}
    </kit.Select>
  );
};

export default Select;
