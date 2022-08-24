import React, { useContext } from "react";
import SpecField from "./SpecField";
import { WidgetProps } from "./widget";
import { KitContext } from "../../atoms/kit-context";
import { generateFromSchema } from "../../utils/schema";
import ArrayGroups from "../ArrayGroups";
import ArrayItems from '../ArrayItems';

const ArrayField: React.FC<WidgetProps> = (props) => {
  const { spec, value = [], path, level, widgetOptions, onChange } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;

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

  if (itemSpec.type === "object") {
    return <ArrayGroups {...props}></ArrayGroups>;
  }

  return <ArrayItems {...props}></ArrayItems>;
};

export const AddToArrayField: React.FC<WidgetProps> = (props) => {
  const kit = useContext(KitContext);
  const { spec, value = [], onChange } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;

  if (typeof itemSpec === "boolean" || !itemSpec) {
    return null;
  }

  return (
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
  );
};

export default ArrayField;
