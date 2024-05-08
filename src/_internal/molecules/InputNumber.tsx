import React, { useCallback, useState, useContext, useEffect } from "react";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import { css } from "@linaria/core";
import { transformStorageUnit, StorageUnit, STORAGE_UNITS } from "../../sunmao/utils/storage";

const InputNumberStyle = css`
  &.dovetail-ant-input::placeholder {
    font-size: 13px;
  }

  .dovetail-ant-input.dovetail-ant-input:not([disabled]) {
    box-shadow: none;
    border: 0;
    
    &:active,
    &:hover,
    &:focus {
      box-shadow: none;
      border: 0;
    }
  }
`;

export const OptionsSpec = Type.Object({
  max: Type.Optional(Type.Number({ title: "Max" })),
  min: Type.Optional(Type.Number({ title: "Min" })),
  prefix: Type.Optional(Type.String()),
  suffix: Type.Optional(Type.String()),
  unit: Type.Optional(Type.String()),
});

type Props = WidgetProps<number | string, Static<typeof OptionsSpec>>;

const InputNumber = (props: Props) => {
  const { displayValues } = props;
  const kit = useContext(KitContext);
  const unit = props.widgetOptions?.unit;
  const transformValue = useCallback((value: string) => {
    if (unit) {
      const isStorageUnit = STORAGE_UNITS.includes(unit);

      if (isStorageUnit) {
        return transformStorageUnit(value, unit as StorageUnit).replace(unit, "")
      }
    }

    return value;
  }, [unit]);
  const [stringValue, setStringValue] = useState(transformValue(props.value + ""));

  const onChange = useCallback(
    (event, newValue, newStringValue) => {
      const newNumberValue = Number(newValue);
      const transformedNewValue = unit ? newValue + unit : newNumberValue;

      // it should only change when the number is safe
      if (newNumberValue < Number.MAX_SAFE_INTEGER && newNumberValue > Number.MIN_SAFE_INTEGER) {
        props.onChange(
          transformedNewValue,
          displayValues,
          props.itemKey,
          props.path
        );
      }

      setStringValue(newStringValue);
    },
    [setStringValue, props, displayValues, unit]
  );

  useEffect(() => {
    setStringValue(transformValue(props.value + ""));
  }, [props.value, transformValue]);

  return (
    <kit.Input
      {...(props.widgetOptions || {})}
      suffix={props.widgetOptions?.suffix || unit}
      className={InputNumberStyle}
      maximum={props.widgetOptions?.max}
      minimum={props.widgetOptions?.min}
      type="int"
      value={stringValue}
      onChange={onChange}
    ></kit.Input>
  );
};

export default InputNumber;
