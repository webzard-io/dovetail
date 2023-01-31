import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import React, { useContext } from "react";
import { KitContext } from "../atoms/kit-context";

export const OptionsSpec = Type.Object({
  disabled: Type.Optional(Type.Boolean()),
  loading: Type.Optional(Type.Boolean()),
});

type Props = WidgetProps<boolean, Static<typeof OptionsSpec>>;

const Switch = (props: Props) => {
  const { displayValues } = props;
  const kit = useContext(KitContext);

  return (
    <kit.Switch
      checked={props.value}
      onChange={(value) =>
        props.onChange(
          value,
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
