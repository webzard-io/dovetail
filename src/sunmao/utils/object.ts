import { first } from "lodash";

export function immutableSet<T>(
  value: T,
  path: string,
  propertyValue: any,
  handleValue?: (value: any, oldValue: any) => any
): T | Record<string, any> {
  if (value !== undefined && value instanceof Object === false) return value;

  const pathArray = path.split(".");
  const nextPath = pathArray.slice(1).join(".");
  const key = first(pathArray) || "";
  const object: Record<string, any> = value || (/\d+/g.test(key) ? [] : {});
  const oldValue = object[key];
  const result: Record<string, any> =
    object instanceof Array
      ? [...object]
      : {
        ...object,
      };

  if (nextPath) {
    const newValue = immutableSet(oldValue, nextPath, propertyValue, handleValue);

    result[key] = handleValue ? handleValue(newValue, oldValue) : newValue;
  } else {
    result[key] = handleValue ? handleValue(propertyValue, oldValue) : propertyValue;
  }

  return result;
}
