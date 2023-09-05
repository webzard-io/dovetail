import { kitContext } from "@cloudtower/eagle";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import React, { useContext } from "react";

export const OptionsSpec = Type.Object({});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const Textarea = (props: Props) => {
  const kit = useContext(kitContext);
  const { value, onChange, displayValues } = props;

  return (
    <kit.textArea
      value={value}
      onChange={(event) =>
        onChange(
          event.currentTarget.value,
          displayValues,
          props.itemKey,
          props.path
        )
      }
    />
  );
};

export default Textarea;
