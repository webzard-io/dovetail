import { JSONSchema7 } from "json-schema";
import { first } from "lodash";

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
