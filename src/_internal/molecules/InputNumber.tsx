import React, { useCallback, useState, useContext, useEffect } from "react";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { kitContext } from "@cloudtower/eagle";
import { css } from "@linaria/core";
import { transformStorageUnit, StorageUnit, STORAGE_UNITS } from "../../sunmao/utils/storage";

const InputNumberStyle = css`
  .ant-input.ant-input:not([disabled]) {
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
  const kit = useContext(kitContext);
  const unit = props.widgetOptions?.unit;
  const transformValue = useCallback((value: string)=> {
    if (unit) {
      const isStorageUnit = STORAGE_UNITS.includes(unit);

      if (isStorageUnit) {
        return transformStorageUnit(value, unit as StorageUnit).replace(unit, "")
      }
    }

    return value;
  }, [unit]);
  const [stringValue, setStringValue] = useState(Number(transformValue(props.value + "")));

  const onChange = useCallback(
    (newValue) => {
      const transformedNewValue = unit ? newValue + unit : Number(newValue);

      props.onChange(
        transformedNewValue,
        displayValues,
        props.itemKey,
        props.path
      );
      setStringValue(newValue);
    },
    [setStringValue, props, displayValues, unit]
  );

  useEffect(() => {
    setStringValue(Number(transformValue(props.value + "")));
  }, [props.value, transformValue]);

  return (
    <kit.fields.Integer
      {...(props.widgetOptions || {})}
      suffix={props.widgetOptions?.suffix || unit}
      className={InputNumberStyle}
      max={props.widgetOptions?.max}
      min={props.widgetOptions?.min}
      type="int"
      input={{
        value: stringValue,
        onChange,
        name: "",
        onFocus: ()=> {},
        onBlur: ()=> {},
      }}
      meta={{}}
    ></kit.fields.Integer>
  );
};

export default InputNumber;
