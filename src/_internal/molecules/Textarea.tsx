import { Input } from "antd";
import { Type, Static } from "@sinclair/typebox";

export const OptionsSpec = Type.Object({});

type Props = {
  value: string;
  onChange(value: string): void;
} & Static<typeof OptionsSpec>;

const Textarea = (props: Props) => {
  const { value, onChange } = props;

  return (
    <Input.TextArea
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
};

export default Textarea;
