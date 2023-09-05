import React, { useCallback } from "react";
import { StringUnion } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { kitContext } from "@cloudtower/eagle";
import { useContext, useEffect, useState } from "react";

export const OptionsSpec = Type.Object({
  addonBefore: Type.Optional(Type.String()),
  addonAfter: Type.Optional(Type.String()),
  type: Type.Optional(StringUnion(["input", "password"])),
  autoComplete: Type.Optional(StringUnion(["on", "off"])),
  visibilityToggle: Type.Optional(Type.Boolean()),
});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const Input = (props: Props) => {
  const { displayValues } = props;
  const [input, setInput] = useState("");
  const kit = useContext(kitContext);
  const onChange = useCallback(
    (e) => {
      setInput(e.target.value);
      props.onChange(e.target.value, displayValues, props.itemKey, props.path);
    },
    [props, displayValues]
  );

  useEffect(() => {
    setInput(props.value);
  }, [props.value]);

  return (
    <kit.input
      {...props.widgetOptions}
      type={props.widgetOptions?.type || "input"}
      onChange={onChange}
      value={input}
      autoComplete={props.widgetOptions?.autoComplete}
    ></kit.input>
  );
};

export default Input;
