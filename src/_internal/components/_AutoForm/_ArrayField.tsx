import React, { useContext } from "react";
import SpecField from "./_SpecField";
import { WidgetProps } from "./widget";

import { CloseOutlined } from "@ant-design/icons";
import { KitContext } from "../../../themes/theme-context";
import { generateFromSchema } from "../../utils/generate-from-schema";

export const ArrayField: React.FC<WidgetProps> = (props) => {
  const { spec, value, path, level, onChange, renderer } = props;
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
        <div key={itemIndex}>
          <div
            style={{
              display: "flex",
              width: "100%",
              borderBottom: "1px solid rgba(225, 230, 241, 0.6)",
              justifyContent: "space-between",
              paddingBottom: 4,
              marginBottom: 4,
            }}
          >
            <div>
              {itemSpec.title ? `${itemSpec.title} ${itemIndex + 1}` : ""}
            </div>
            <kit.Button
              size="small"
              type="text"
              onClick={() => {
                onChange(value.filter((v) => v !== itemValue));
              }}
            >
              <CloseOutlined />
            </kit.Button>
          </div>
          <SpecField
            {...props}
            value={itemValue}
            spec={{
              ...itemSpec,
              title: itemSpec.title,
            }}
            path={path.concat(`[${itemIndex}]`)}
            level={level + 1}
            renderer={renderer}
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
          size="medium"
          onClick={() => {
            onChange(value.concat(generateFromSchema(itemSpec)));
          }}
        >
          添加
        </kit.Button>
      </div>
    </>
  );
};

export default ArrayField;
