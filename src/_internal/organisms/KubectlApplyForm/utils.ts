import { get, groupBy } from "lodash";
import { TransformedField, Field } from "./type";

function getDataPath(p: string) {
  const [indexStr] = p.split(/\.(.*)/s);
  const index = parseInt(indexStr, 10);
  let dataPath = String(p.endsWith(".*") ? index : p);
  dataPath = dataPath.replace(/.\$add$/, "");
  return dataPath;
}

function iterateArrPath(
  p: string,
  values: any[],
  cb: (f: { itemDataPath: string; itemValue: any }) => void
) {
  const arrPathMatch = p.split(/\.\$i(.*)/s);
  if (arrPathMatch.length === 1) {
    const itemPath = arrPathMatch[0];
    const itemDataPath = getDataPath(itemPath);
    const itemValue = get(values, itemDataPath);
    cb({
      itemDataPath,
      itemValue,
    });
    return;
  }
  const [arrPath] = arrPathMatch;
  const value = get(values, getDataPath(arrPath));
  if (!Array.isArray(value)) {
    return;
  }
  value.forEach((__, idx) => {
    const nextP = p.replace("$i", String(idx));
    iterateArrPath(nextP, values, cb);
  });
}

// magic heuristic infer array struct, we should be able to find better way
function heuristicGroupArray(fields: TransformedField[]): TransformedField[] {
  const newFields = [];

  const groupedByPrefix = groupBy(fields, (f) => {
    const arrPathMatch = f.path.split(/\.\$i(.*)/s);
    if (arrPathMatch.length === 1) {
      return arrPathMatch[0];
    }
    return arrPathMatch[0].concat(".$i");
  });

  for (const subFields of Object.values(groupedByPrefix)) {
    if (subFields.length === 1) {
      newFields.push(subFields[0]);
      continue;
    }
    const groupedByPath = groupBy(subFields, "path");
    const subSubFieldsArr = Object.values(groupedByPath);
    for (let idx = 0; idx < subSubFieldsArr[0].length; idx++) {
      for (const subSubFields of subSubFieldsArr) {
        newFields.push(subSubFields[idx]);
      }
    }
  }

  return newFields;
}

export function transformFields(
  fields: Field[],
  values: any[]
): TransformedField[] {
  const newFields = [];
  for (const f of fields) {
    if (f.path.includes(".$i")) {
      iterateArrPath(f.path, values, ({ itemDataPath, itemValue }) => {
        newFields.push({
          ...f,
          dataPath: itemDataPath,
          value: itemValue,
        });
      });
    } else {
      const dataPath = getDataPath(f.path);
      newFields.push({
        ...f,
        dataPath,
        value: get(values, dataPath),
      });
    }
  }

  return heuristicGroupArray(newFields);
}
