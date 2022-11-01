import { Input } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const Textarea = (props: Props) => {
  const { value, onChange } = props;

  return (
    <Input.TextArea
      value={value}
      onChange={(event) =>
        onChange(
          event.currentTarget.value,
          `${props.subKey ? `${props.subKey}${props.field?.key ? '-' : ''}` : ""}${props.field?.key || ""}`,
          props.path
        )
      }
    />
  );
};

export default Textarea;
