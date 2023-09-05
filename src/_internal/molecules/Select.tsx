import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { kitContext } from "@cloudtower/eagle";
import React, { useContext, useEffect } from "react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";

const OptionStyle = css`
  &.ant-select-item-option-disabled {
    color: unset;

    .ant-select-item-option-content {
      opacity: 0.5;
    }
  }
`;

const OptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .ant-tag {
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

  &:empty {
    display: none;
  }
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
  const kit = useContext(kitContext);
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
    <kit.select
      disabled={disabled}
      input={{
        value: (value || ""),
        onChange: (value, option: any) =>
          onChange(
            value,
            {
              ...displayValues,
              [path]: option.label,
            },
            props.itemKey,
            props.path
          )
      }}
      showSearch
      optionLabelProp="label"
      optionFilterProp="children"
      dropdownMatchSelectWidth={dropdownMatchSelectWidth}
    >
      {options.map((option) => {
        const isShowDisabledMessage = option.disabled && option.disabledMessage;
        const isShowTip = option.tip;

        return (
          <kit.option
            key={option.value}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            className={OptionStyle}
          >
            <OptionWrapper>
              <span>{option.label}</span>
              {(option.tags || []).map((tag) => (
                <kit.tag key={tag.name} color={tag.color}>{tag.name}</kit.tag>
              ))}
            </OptionWrapper>
            <ExtractWrapper>
              {isShowDisabledMessage ? (
                <DisabledMessage>{option.disabledMessage}</DisabledMessage>
              ) : null}
              {isShowDisabledMessage && isShowTip ? <Splitor>·</Splitor> : null}
              {isShowTip ? <OptionTip>{option.tip}</OptionTip> : null}
            </ExtractWrapper>
          </kit.option>
        );
      })}
    </kit.select>
  );
};

export default Select;
