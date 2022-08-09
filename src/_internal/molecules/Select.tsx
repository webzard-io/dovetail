import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";

export const OptionsSpec = Type.Object({
  options: Type.Array(
    Type.Object({
      label: Type.String(),
      value: Type.String(),
    })
  ),
});

type Props = {
  value: string;
  onChange(value: string): void;
} & Static<typeof OptionsSpec>;

const Select = (props: Props) => {
  const { value, onChange, options = [] } = props;

  return (
    <AntdSelect
      value={String(value || '')}
      onChange={(value) => onChange(value)}
      showSearch
      optionFilterProp="children"
    >
      {options.map((option, idx) => {
        return (
          <AntdSelect.Option key={idx} value={option.value}>
            {option.label}
          </AntdSelect.Option>
        );
      })}
    </AntdSelect>
  );
};

export default Select;
