import React from "react";
import { WidgetProps } from "./widget";
import Group from "../Group";
import SpecField from "./SpecField";
import { getJsonSchemaByPath } from "src/_internal/utils/schema";
import { immutableSet } from "../../../editor/utils/object";
import { get } from "lodash";
import type { Field } from "../../organisms/KubectlApplyForm/KubectlApplyForm";

export function resolveSubFields(props: WidgetProps) {
  const { field, spec, value, path, level, onChange } = props;
  const fields: Field[] = field?.fields || [];
  const properties = Object.keys(spec.properties || {});

  if (fields.length) {
    // if configure the sub fields then use them
    return fields.map((subField) => {
      if (!subField.path) return null;

      const subSpec = getJsonSchemaByPath(spec, subField.path) || {};

      return (
        <SpecField
          {...props}
          field={subField}
          widget={subField.widget}
          widgetOptions={subField.widgetOptions}
          key={subField.path}
          spec={{
            ...subSpec,
            title: subField.label || subSpec.title || subField.path,
          }}
          path={path.concat(`.${subField.path}`)}
          level={level + 1}
          value={get(value, subField.path)}
          onChange={(newValue, key) => {
            const result = immutableSet(value, subField.path, newValue);

            onChange(result, key);
          }}
        />
      );
    });
  } else {
    // show all properties
    return properties.map((name) => {
      const subSpec = (spec.properties || {})[name] as WidgetProps["spec"];

      if (typeof subSpec === "boolean") {
        return null;
      }

      return (
        <SpecField
          {...props}
          key={name}
          field={undefined}
          spec={{
            ...subSpec,
            title: subSpec.title || name,
          }}
          path={path.concat(`.${name}`)}
          level={level + 1}
          value={value?.[name]}
          widgetOptions={{}}
          onChange={(newValue, key) => {
            onChange({
              ...value,
              [name]: newValue,
            }, key);
          }}
        />
      );
    });
  }
}

export const ObjectField: React.FC<WidgetProps> = (props) => {
  return <Group {...props}></Group>;
};

export default ObjectField;
