export declare type SerializableBasic = null | undefined | string | number | boolean;
export declare type SerializableArray = Serializable[];
export declare type SerializableObject = {
    [key: string]: Serializable;
};
export declare type Serializable = SerializableBasic | SerializableArray | SerializableObject;

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
