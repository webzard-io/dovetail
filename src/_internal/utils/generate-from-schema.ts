import { JSONSchema7 } from "json-schema";

export function generateFromSchema(spec: JSONSchema7, noOptional = false): any {
  if (!spec) {
    return {};
  }
  switch (true) {
    case spec.type === "string" && "enum" in spec && Boolean(spec.enum?.length):
      return spec.enum![0];
    case spec.type === "string":
      return "";
    case spec.type === "boolean":
      return false;
    case spec.type === "array":
      return [];
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
