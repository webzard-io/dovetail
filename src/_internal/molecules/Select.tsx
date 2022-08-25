import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({
  options: Type.Array(
    Type.Object({
      label: Type.String(),
      value: Type.String(),
    })
  ),
});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const Select = (props: Props) => {
  const { value, onChange, widgetOptions } = props;
  const { options = [] } = widgetOptions || { options: [] };

  return (
    <AntdSelect
      value={String(value || "")}
      onChange={(value) => onChange(value, props.field?.key)}
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
