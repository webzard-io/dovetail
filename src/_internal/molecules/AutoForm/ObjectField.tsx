import React from "react";
import SpecField from "./SpecField";
import { WidgetProps } from "./widget";
import type { Field } from "../../organisms/KubectlApplyForm/KubectlApplyForm";
import { getJsonSchemaByPath } from 'src/_internal/utils/schema';
import { immutableSet } from "../../../editor/utils/object";
import { get } from "lodash";

export const ObjectField: React.FC<WidgetProps> = (props) => {
  const { field, spec, value, path, level, onChange, renderer } = props;
  const fields: Field[] = field?.fields || [];
  const properties = Object.keys(spec.properties || {});
  let elements: React.ReactNode[] = [];

  if (fields.length) {
    // if configure the sub fields then use them
    elements = fields.map((subField) => {
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
          renderer={renderer}
          level={level + 1}
          value={get(value, subField.path)}
          onChange={(newValue) => {
            const result = immutableSet(value, subField.path, newValue);
            
            onChange(result);
          }}
        />
      );
    });
  } else {
    // show all properties
    elements = properties.map((name) => {
      const subSpec = (spec.properties || {})[name] as WidgetProps["spec"];

      if (typeof subSpec === "boolean") {
        return null;
      }

      return (
        <SpecField
          {...props}
          key={name}
          spec={{
            ...subSpec,
            title: subSpec.title || name,
          }}
          path={path.concat(`.${name}`)}
          renderer={renderer}
          level={level + 1}
          value={value?.[name]}
          onChange={(newValue) => {
            onChange({
              ...value,
              [name]: newValue,
            });
          }}
        />
      );
    });
  }

  return <>{elements}</>;
};

export default ObjectField;
