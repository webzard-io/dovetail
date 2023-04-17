import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import React, { useContext, useEffect } from "react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";

const OptionStyle = css`
  &.dovetail-ant-select-item-option-disabled {
    color: unset;

    .dovetail-ant-select-item-option-content {
      opacity: 0.5;
    }
  }
`;

const OptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .dovetail-ant-tag {
    border: 0;
  }
`;

const OptionTip = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: rgba(44, 56, 82, 0.6);
  white-space: pre-wrap;
`;

const Splitor = styled.div`
  width: 20px;
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: rgba(44, 56, 82, 0.6);
  text-align: center;
`;

const DisabledMessage = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #f0483e;
`;

const ExtractWrapper = styled.div`
  display: flex;
  margin-top: 6px;
`;

export const OptionsSpec = Type.Object({
  options: Type.Array(
    Type.Object({
      label: Type.String(),
      value: Type.String(),
      disabled: Type.Optional(Type.Boolean()),
      disabledMessage: Type.Optional(Type.String()),
      tags: Type.Array(
        Type.Object({
          name: Type.String(),
          color: Type.String(),
        })
      ),
      tip: Type.Optional(Type.String()),
    })
  ),
  dropdownMatchSelectWidth: Type.Optional(Type.Number()),
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
  const {
    options = [],
    disabled,
    dropdownMatchSelectWidth,
  } = widgetOptions || { options: [] };

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
      dropdownMatchSelectWidth={dropdownMatchSelectWidth}
    >
      {options.map((option, idx) => {
        return (
          <AntdSelect.Option
            key={idx}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            className={OptionStyle}
          >
            <OptionWrapper>
              <span>{option.label}</span>
              {(option.tags || []).map((tag) => (
                <kit.Tag color={tag.color}>{tag.name}</kit.Tag>
              ))}
            </OptionWrapper>
            <ExtractWrapper>
              {option.disabled && option.disabledMessage ? (
                <>
                  <DisabledMessage>{option.disabledMessage}</DisabledMessage>
                  <Splitor>·</Splitor>
                </>
              ) : null}
              {option.tip ? <OptionTip>{option.tip}</OptionTip> : null}
            </ExtractWrapper>
          </AntdSelect.Option>
        );
      })}
    </kit.Select>
  );
};

export default Select;
