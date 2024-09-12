import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import React, { useContext, useMemo } from "react";
import { KitContext } from "../atoms/kit-context";

export const OptionsSpec = Type.Object({
  disabled: Type.Optional(Type.Boolean()),
  loading: Type.Optional(Type.Boolean()),
  valueMap: Type.Optional(Type.Record(Type.String(), Type.Boolean()))
});

type Props = WidgetProps<boolean | string, Static<typeof OptionsSpec>>;

const Switch = (props: Props) => {
  const { displayValues } = props;
  const kit = useContext(KitContext);
  const isNeedTransform = useMemo(() => {
    return Object.keys(props.widgetOptions?.valueMap || {}).length && typeof props.value === "string";
  }, [props.widgetOptions?.valueMap, props.value]);

  return (
    <kit.Switch
      checked={!!(isNeedTransform ? props.widgetOptions?.valueMap?.[props.value as string] : props.value)}
      onChange={(checked) =>
        props.onChange(
          isNeedTransform ?
            Object.entries(props.widgetOptions?.valueMap || {}).find(([key, value]) => value === checked)?.[0] || checked :
            checked,
          displayValues,
          props.itemKey,
          props.path
        )
      }
      disabled={props.widgetOptions?.disabled}
      loading={props.widgetOptions?.loading}
    ></kit.Switch>
  );
};

export default Switch;
