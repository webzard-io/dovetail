import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({
  options: Type.Array(
    Type.Object({
      label: Type.String(),
      value: Type.String(),
      disabled: Type.Optional(Type.Boolean()),
    })
  ),
  disabled: Type.Optional(Type.Boolean()),
});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const Select = (props: Props) => {
  const { value, onChange, widgetOptions } = props;
  const { options = [], disabled } = widgetOptions || { options: [] };

  return (
    <AntdSelect
      disabled={disabled}
      value={String(value || "")}
      onChange={(value) =>
        onChange(
          value,
          `${props.subKey ? `${props.subKey}${props.field?.key ? '-' : ''}` : ""}${props.field?.key || ""}`
        )
      }
      showSearch
      optionFilterProp="children"
    >
      {options.map((option, idx) => {
        return (
          <AntdSelect.Option
            key={idx}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </AntdSelect.Option>
        );
      })}
    </AntdSelect>
  );
};

export default Select;
