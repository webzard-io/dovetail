import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from '../atoms/kit-context';
import { useContext } from 'react';

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

type Props = WidgetProps<string | string[], Static<typeof OptionsSpec>>;

const Select = (props: Props) => {
  const kit = useContext(KitContext)
  const { value, onChange, widgetOptions } = props;
  const { options = [], disabled } = widgetOptions || { options: [] };

  return (
    <kit.Select
      disabled={disabled}
      value={(value || "") as any}
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
    </kit.Select>
  );
};

export default Select;
