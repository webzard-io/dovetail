import { JSONSchema7 } from "json-schema";
import { first } from "lodash";

export function generateFromSchema(spec: JSONSchema7, noOptional = false): any {
  if (!spec) {
    return {};
  }
  if ("default" in spec) {
    return spec.default;
  }
  switch (true) {
    case spec.type === "string" && "enum" in spec && Boolean(spec.enum?.length):
      return spec.enum![0];
    case spec.type === "string":
      return "";
    case spec.type === "boolean":
      return false;
    case spec.type === "array":
      if (
        !spec.minItems ||
        !spec.items ||
        typeof spec.items === "boolean" ||
        Array.isArray(spec.items)
      ) {
        return [];
      }
      return new Array(spec.minItems).fill(generateFromSchema(spec.items));
    case spec.type === "number":
    case spec.type === "integer":
      return 0;
    case spec.type === "object": {
      const obj: Record<string, any> = {};
      for (const key in spec.properties) {
        obj[key] = generateFromSchema(
          spec.properties[key] as JSONSchema7,
          noOptional
        );
      }
      return obj;
    }
    case Array.isArray(spec.type) &&
      "anyOf" in spec &&
      Boolean(spec.anyOf?.length):
    case Array.isArray(spec.type) &&
      "oneOf" in spec &&
      Boolean(spec.oneOf?.length): {
      const subSpec = (spec.anyOf! || spec.oneOf!)[0];
      return generateFromSchema(subSpec as JSONSchema7, noOptional);
    }
    default:
      return undefined;
  }
}

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
