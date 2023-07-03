import useLocalStorage from 'src/_internal/atoms/hooks/useLocalStorage';
import { useMemo, useCallback, useRef } from 'react';
import { isEqual, omit } from 'lodash';
import { getValue } from 'src/_internal/atoms/hooks/utils';

export type CustomizeColumnType = {
  key: string;
  width?: number;
  display: boolean;
};

type T = CustomizeColumnType[];
export const useCustomizeColumn = (
  key: string,
  defaultFieldsValue: T | (() => T)
): [T, (obj: T | ((val: T) => T)) => void, (_key?: string) => void] => {
  const [storage, setStorage] = useLocalStorage('dovetail-table-customize-column', {});
  const keyRef = useRef(key);
  keyRef.current = key;

  const fieldsValue = useMemo(
    () => {
      const unwrappedValue = getValue<T>(defaultFieldsValue);
      if (key in storage) {
        const setOfOldColumnKeys = new Set(storage[key].map(item => item.key));
        // merge new columns to cached data
        // `_action_` column should be the last one, others need to be inserted before that
        unwrappedValue.forEach(item => {
          if (!setOfOldColumnKeys.has(item.key)) {
            setOfOldColumnKeys.has('_action_')
              ? storage[key].splice(storage[key].length - 1, 0, item)
              : storage[key].push(item);
          }
        });
        return storage[key];
      }

      return unwrappedValue;
    },
    // defaultFieldsValue should be static
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storage, key]
  );

  const setValue = (val: T | ((val: T) => T)) => {
    const nextValue = getValue<T>(val, fieldsValue);
    setStorage({ ...storage, [key]: nextValue });
  };

  const removeValue = useCallback(
    (_key?: string) => {
      setStorage(storage => omit(storage, _key || keyRef.current));
    },
    [setStorage]
  );

  return [fieldsValue, setValue, removeValue];
};

export function useEqualAllColumnKeys<T>(nextAllColumnKeys: T): T | undefined {
  const _allColumnKeys = useRef<T | undefined>();

  if (!isEqual(_allColumnKeys.current, nextAllColumnKeys)) {
    _allColumnKeys.current = nextAllColumnKeys;
  }

  return _allColumnKeys.current;
}
