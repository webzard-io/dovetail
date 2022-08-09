export function arrayMove<T>(
  arr: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (fromIndex === toIndex) return arr;
  if (fromIndex > arr.length - 1) return arr;

  const cloneArr = [...arr];
  const element = cloneArr[fromIndex];
  cloneArr.splice(fromIndex, 1);
  cloneArr.splice(toIndex, 0, element);
  return cloneArr;
}
