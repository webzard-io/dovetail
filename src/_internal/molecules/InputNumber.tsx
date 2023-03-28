import React, { useCallback, useState, useContext, useEffect } from "react";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import { css } from "@linaria/core";

const InputNumberStyle = css`
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
});

type Props = WidgetProps<number, Static<typeof OptionsSpec>>;

const InputNumber = (props: Props) => {
  const { displayValues } = props;
  const kit = useContext(KitContext);
  const [stringValue, setStringValue] = useState(props.value);

  const onChange = useCallback(
    (event, newValue) => {
      props.onChange(
        Number(newValue),
        displayValues,
        props.itemKey,
        props.path
      );
      setStringValue(newValue);
    },
    [setStringValue, props, displayValues]
  );

  useEffect(() => {
    setStringValue(props.value);
  }, [props.value]);

  return (
    <kit.Input
      {...(props.widgetOptions || {})}
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
