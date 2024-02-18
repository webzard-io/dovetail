import { useCallback } from "react";
import { isNil } from "lodash";

type Props = {
  supportNegativeValue?: boolean;
  maximum?: number;
  minimum?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, value: string | number, rawValue: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

function useInt(props: Props) {
  const onChange = useCallback(
    (e) => {
      const value = e.currentTarget.value;
      if (props.supportNegativeValue) {
        if (value === "" || value === "-") {
          props.onChange?.(e, value, value);
        } else if (/^(-)?\d+$/.test(value)) {
          const v = parseInt(value);
          props.onChange?.(e, !Number.isNaN(v) ? v : "", value);
        }
      } else if (value === "" || /^\d+$/.test(value)) {
        const v = parseInt(value);
        props.onChange?.(e, !Number.isNaN(v) ? v : "", value);
      }
    },
    [props.onChange, props.supportNegativeValue]
  );
  const onBlur = useCallback(
    (e) => {
      const maximumIsValid = typeof props.maximum === "number";
      const minimumIsValid = typeof props.minimum === "number";

      if (maximumIsValid || minimumIsValid) {
        const rawValue = e.target.value;
        const value = parseInt(rawValue) || 0;
        
        if (isNil(value)) {
          props.onChange?.(e, "", rawValue);
        }
        if (!isNil(value) && maximumIsValid && (props.maximum || 0) < value) {
          props.onChange?.(e, props.maximum || 0, rawValue);
        }
        if (!isNil(value) && minimumIsValid && (props.minimum || 0) > value) {
          props.onChange?.(e, props.minimum || 0, rawValue);
        }
      }

      props.onBlur?.(e);
    },
    [props.onBlur, props.onChange, props.maximum, props.minimum]
  );

  return {
    onChange,
    onBlur,
  };
}

export default useInt;
