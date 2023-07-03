import { useCallback, useEffect, useRef, useState } from 'react';
import { getValue } from './utils';

type SerializableBasic = null | undefined | string | number | boolean;
type SerializableArray = Serializable[];
type SerializableObject = {
    [key: string]: Serializable;
};
type Serializable = SerializableBasic | SerializableArray | SerializableObject;

type SetValue<T> = (obj: T | ((val: T) => T)) => void;

interface CustomStorageEvent<T> extends Event {
  key?: string;
  value?: T;
}

export const dispatchStorageEvent = <T extends Serializable>(
  key: string,
  value: T
) => {
  const storageEvent: CustomStorageEvent<Serializable> = new Event(
    'storageChange'
  );
  storageEvent.key = key;
  storageEvent.value = value;
  document.dispatchEvent(storageEvent);
};

type CustomizeColumnType = {
  key: string;
  width?: number;
  display: boolean;
};

export type LocalStorage = {
  'dovetail-table-customize-column': Record<string, CustomizeColumnType[]>;
};

const localStorageVersions: Record<keyof LocalStorage, number> = {
  'dovetail-table-customize-column': 1,
};

export default function useLocalStorage<K extends keyof LocalStorage>(
  key: K,
  defaultValue: LocalStorage[K] | (() => LocalStorage[K])
): [LocalStorage[K], SetValue<LocalStorage[K]>, () => void] {
  const versions = localStorageVersions[key];

  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return getValue(defaultValue);
      let localItem;
      try {
        localItem = JSON.parse(item);
      } catch {
        // ignore
      }

      if (!localItem?.versions || versions > localItem?.versions) {
        const nextValue = getValue(defaultValue);

        window.localStorage.setItem(
          key,
          JSON.stringify({ value: nextValue, versions })
        );
        return nextValue;
      } else {
        return localItem.value;
      }
    } catch (error) {
      return getValue(defaultValue);
    }
  });

  const onStorageChange = useCallback(
    (e: CustomStorageEvent<LocalStorage[K]>) => {
      if (e.key === key) {
        setValue(e.value as LocalStorage[K]);
      }
    },
    [key]
  );

  const storageListener = useCallback((e: StorageEvent) => {
    if (!e.key) {
      return;
    }
    if (e.newValue) {
      try {
        if (localStorage.getItem(e.key) === e.newValue) {
          return;
        }
        const newValue = JSON.parse(e.newValue).value;
        dispatchStorageEvent(e.key, newValue);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('json parse failed', error);
        }
      }
    } else {
      dispatchStorageEvent(e.key, null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('storageChange', onStorageChange);
    window.addEventListener('storage', storageListener);
    return () => {
      document.removeEventListener('storageChange', onStorageChange);
      window.removeEventListener('storage', storageListener);
    };
  }, [onStorageChange, storageListener]);

  const valueRef = useRef(value);
  valueRef.current = value;
  const _setValue = useCallback(
    (val: LocalStorage[K] | ((val: LocalStorage[K]) => LocalStorage[K])) => {
      const nextValue = getValue(val, valueRef.current);

      window.localStorage.setItem(
        key,
        JSON.stringify({ value: nextValue, versions })
      );
      // NOTE: This event should be fired after the line above. The order does matter, for unknown reason!
      dispatchStorageEvent(key, nextValue);
    },
    [key, versions]
  );

  const removeLocalStorage = () => {
    dispatchStorageEvent(key, null);
    window.localStorage.removeItem(key);
  };

  return [value, _setValue, removeLocalStorage];
}
