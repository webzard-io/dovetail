import React from "react";
import { WidgetProps } from "./widget";
import Group from "../Group";
import SpecField from "./SpecField";
import { getJsonSchemaByPath } from "src/_internal/utils/schema";
import { get, set } from "lodash";
import type { Field } from "../../organisms/KubectlApplyForm/type";
import { isObject } from "lodash";
import { JSONSchema7 } from "json-schema";
import { immutableSet } from "../../../sunmao/utils/object";

export function resolveSubFields(props: WidgetProps) {
  const { specsArray, field, spec, value, path, level, error, widgetOptions, onChange } =
    props;
  const fields: Field[] = field?.fields || [];
  const properties = Object.keys(spec.properties || {});
  const isLayout = field?.type === "layout";

  if (fields.length) {
    // if configure the sub fields then use them
    return fields.map((subField) => {
      if (!subField.path) return null;

      let subSpec: JSONSchema7 | null = {};
      const errorInfo = subField?.error || error;

      if (field?.path) {
        subSpec = getJsonSchemaByPath(spec, subField.path);
      } else {
        const [schemaIndex, ...subPath] = subField.path.split(".");

        subSpec =
          specsArray[Number(schemaIndex)]?.[subPath.join(".")].spec || {};
      }

      return subSpec ? (
        <SpecField
          {...props}
          error={
            errorInfo && isObject(errorInfo) && subField?.key
              ? (errorInfo[subField.key as keyof typeof errorInfo] as string)
              : errorInfo
          }
          field={subField}
          widget={subField.widget}
          widgetOptions={{ disabled: widgetOptions?.disabled, ...subField.widgetOptions}}
          key={subField.key || subField.path}
          spec={subSpec}
          path={path.concat(isLayout ? subField.path : `.${subField.path}`)}
          level={level + 1}
          value={get(value, subField.path)}
          onChange={(newValue, displayValues, key, dataPath) => {
            if (isLayout) {
              onChange(newValue, displayValues, key, dataPath);
            } else {
              const result = immutableSet(value, subField.path, newValue);

              onChange(result, displayValues, key, dataPath);
            }
          }}
        />
      ) : null;
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
          widgetOptions={{ disabled: widgetOptions?.disabled }}
          onChange={(newValue, key, dataPath) => {
            onChange(
              {
                ...(value || {}),
                [name]: newValue,
              },
              key,
              dataPath
            );
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
