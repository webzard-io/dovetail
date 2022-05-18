import React, { useContext } from "react";
import SpecField from "./_SpecField";
import { WidgetProps } from "./widget";

import { PlusCircleOutlined } from "@ant-design/icons";
import { KitContext } from "../../../themes/theme-context";

export const ArrayField: React.FC<WidgetProps> = (props) => {
  const { spec, value, path, level, onChange } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;
  const kit = useContext(KitContext);

  if (typeof itemSpec === "boolean" || !itemSpec) {
    return null;
  }

  if (!Array.isArray(value)) {
    return (
      <div>
        Expected array but got
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }

  return (
    <>
      {value.map((itemValue, itemIndex) => (
        <div
          key={itemIndex}
          // index={itemIndex}
          // value={value}
          // onChange={onChange}
        >
          <SpecField
            {...props}
            value={itemValue}
            spec={{
              ...itemSpec,
              title: itemSpec.title,
            }}
            path={path.concat(String(itemIndex))}
            level={level + 1}
            onChange={(newItemValue: any) => {
              const newValue = [...value];
              newValue[itemIndex] = newItemValue;
              onChange(newValue);
            }}
          />
        </div>
      ))}
      <div>
        <kit.Button
          size="small"
          onClick={() => {
            onChange(value.concat({}));
          }}
        >
          <PlusCircleOutlined />
        </kit.Button>
      </div>
    </>
  );
};

export default ArrayField;
