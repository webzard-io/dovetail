import { Serializable } from '@tower/utils';

export const getSearch = <T extends Serializable>(
  searchString: string,
  defaultValue: T
) => {
  let search!: T;
  try {
    search = JSON.parse(searchString);
  } catch {
    search = defaultValue;
  }
  return search;
};

export function getValue<T extends Serializable>(
  val: T | Function,
  params?: T
): T {
  return typeof val === 'function' ? val(params) : val;
}
