import React, { useCallback } from "react";
import { StringUnion } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
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
  const kit = useContext(KitContext);
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
    <kit.Input
      {...props.widgetOptions}
      type={props.widgetOptions?.type || "input"}
      onChange={onChange}
      value={input}
      autoComplete={props.widgetOptions?.autoComplete}
    ></kit.Input>
  );
};

export default Input;
