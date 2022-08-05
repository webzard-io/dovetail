import { JSONSchema7 } from "json-schema";
import { first } from "lodash";

export function getJsonSchemaByPath(
  schema: JSONSchema7,
  path: string
): JSONSchema7 | null {
  if (path === "") {
    return schema;
  }

  const pathArray = path.split(".");
  const nextPath = pathArray.slice(1).join(".");
  const key = first(pathArray) || "";

  if (schema.type === "object" && schema.properties?.[key]) {
    return getJsonSchemaByPath(schema.properties[key] as JSONSchema7, nextPath);
  } else if (schema.type === "array" && schema.items) {
    return getJsonSchemaByPath(schema.items as JSONSchema7, nextPath);
  }

  return null;
}

type JSONSchemaWithWidgetOptions = JSONSchema7 & { widgetOptions?: Record<string, any> };

export function mergeWidgetOptionsByPath(
  spec: JSONSchemaWithWidgetOptions,
  path: string,
  options: Record<string, any>
): JSONSchemaWithWidgetOptions {
  const pathArray = path.split(".");
  const nextPath = pathArray.slice(1).join(".");
  const key = first(pathArray) || "";

  if (path === "") {
    return {
      ...spec,
      widgetOptions: {
        ...(spec.widgetOptions || {}),
        ...options,
      },
    };
  }

  if (spec.type === "object" && spec.properties?.[key]) {
    return {
      ...spec,
      properties: {
        ...spec.properties,
        [key]: mergeWidgetOptionsByPath(
          spec.properties[key] as JSONSchema7,
          nextPath,
          options
        ),
      },
    };
  } else if (spec.type === "array" && spec.items) {
    return {
      ...spec,
      items: mergeWidgetOptionsByPath(spec.items as JSONSchema7, nextPath, options),
    };
  }

  return spec;
}
