import React, { useContext } from "react";
import SpecField from "./SpecField";
import { WidgetProps } from "./widget";
import { KitContext } from "../../atoms/kit-context";
import { generateFromSchema } from "../../utils/schema";
import ArrayGroups from "../ArrayGroups";
import ArrayItems from "../ArrayItems";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";

const ArrayField: React.FC<WidgetProps> = (props) => {
  const { spec, value = [] } = props;
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
  const { t } = useTranslation();
  const kit = useContext(KitContext);
  const { displayValues, spec, value = [], onChange } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;

  if (typeof itemSpec === "boolean" || !itemSpec) {
    return null;
  }

  return (
    <div>
      <kit.Button
        prefixIcon="1-plus-add-create-new-16-gray"
        hoverPrefixIcon="1-plus-add-create-new-16-blue"
        size="small"
        onClick={() => {
          const defaultValue =
            props.field?.defaultValue?.[0] ?? generateFromSchema(itemSpec);

          onChange(
            value.concat(
              defaultValue && typeof defaultValue === "object"
                ? cloneDeep(defaultValue)
                : defaultValue
            ),
            displayValues
          );
        }}
      >
        {t("dovetail.add")}
      </kit.Button>
    </div>
  );
};

export default ArrayField;
