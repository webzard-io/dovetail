export enum StorageUnit {
  Ei = "Ei",
  Pi = "Pi",
  Ti = "Ti",
  Gi = "Gi",
  Mi = "Mi",
  Ki = "Ki"
}

export const STORAGE_UNITS = ["Ei", "Pi", "Ti", "Gi", "Mi", "Ki",];

export function findUnit(value: string | number, units: string[]) {
  if (typeof value !== "string") return false;

  const index = units.findIndex(unit => value.endsWith(unit));

  return index === -1 ? null : {
    index,
    unit: units[index]
  };
}


export function transformStorageUnit(value: string, unit: StorageUnit): string {
  const unitInfo = findUnit(value, STORAGE_UNITS);
  const targetIndex = STORAGE_UNITS.indexOf(unit);

  if (targetIndex === -1 || !unitInfo) return value;

  let { index } = unitInfo;
  let number = Number(value.replace(unitInfo.unit, ""));

  while (index !== targetIndex) {
    if (index < targetIndex) {
      number *= 1024;
      index++;
    } else if (index > targetIndex) {
      number /= 1024;
      index--;
    }
  }

  return `${number}${unit}`;
}
