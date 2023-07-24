import { useRef, useState, useCallback } from "react";
import { merge } from "lodash";

type OnChange<T> = (mergedValue: T) => void;

function useMergeState<T extends (Record<string, unknown> | Record<string, unknown>[])>(
  defaultValue: T | (() => T),
  onChange?: OnChange<T>,
) {
  const [value, setValue] = useState<T>(defaultValue);
  const valueRef = useRef<T>(value);
  const isArray = value instanceof Array;

  const mergeValue = useCallback((newValue: T, callback?: OnChange<T>) => {
    valueRef.current = merge(isArray ? [] : {}, valueRef.current, newValue);

    setValue(valueRef.current);
    onChange?.(valueRef.current);
    callback?.(valueRef.current);
  }, [isArray, onChange]);

  return { value, setValue, mergeValue, valueRef };
}

export default useMergeState;
