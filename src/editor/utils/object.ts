import { first } from "lodash";

export function immutableSet(
  object: Record<string, any>,
  path: string,
  value: any
) {
  const pathArray = path.split(".");
  const nextPath = pathArray.slice(1).join(".");
  const key = first(pathArray) || "";
  const oldValue = object[key];
  const result = {
    ...object,
  };

  if (nextPath) {
    if (oldValue && typeof oldValue === "object") {
      result[key] = immutableSet(oldValue, nextPath, value);
    }
  } else {
    result[key] = value;
  }

  return result;
}
