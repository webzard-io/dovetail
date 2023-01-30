import React, { useCallback } from "react";
import LabelGroup, { LabelGroupProps } from "./LabelGroup";

enum LabelKeyErrorCode {
  PREFIX_OUT_OF_LENGTH = "PREFIX_OUT_OF_LENGTH",
  PREFIX_WRONG_FORMAT = "PREFIX_WRONG_FORMAT",
  NAME_REQUIRED = "NAME_REQUIRED",
  NAME_OUT_OF_LENGTH = "NAME_OUT_OF_LENGTH",
  NAME_WRONG_FORMAT = "NAME_WRONG_FORMAT",
}

enum LabelValueErrorCode {
  VALUE_REQUIRED = "VALUE_REQUIRED",
  VALUE_OUT_OF_LENGTH = "NAME_OUT_OF_LENGTH",
  VALUE_WRONG_FORMAT = "NAME_WRONG_FORMAT",
}

export type LabelKeyValidationError = {
  code: LabelKeyErrorCode;
};

export type LabelValueValidationError = {
  code: string;
};

export type K8sLabelGroupProps = LabelGroupProps;

function validateValueLength(value: string) {
  return value.length <= 63;
}

function validateValueFormat(value: string) {
  return /(^[a-z0-9A-Z]$)|(^[a-z0-9A-Z][a-z0-9A-Z-_.]*[a-z0-9A-Z]$)/g.test(
    value
  );
}

const KEY_VALIDATORS = [
  {
    validate: (value: string) => {
      const hasPrefix = value.includes("/");

      if (hasPrefix) {
        const [prefix] = value.split("/");

        return prefix.length <= 253
          ? null
          : LabelKeyErrorCode.PREFIX_OUT_OF_LENGTH;
      }

      return null;
    },
  },
  {
    validate: (value: string) => {
      const hasPrefix = value.includes("/");

      if (hasPrefix) {
        const [prefix] = value.split("/");

        return /[a-zA-Z0-9.]+/g.test(prefix)
          ? null
          : LabelKeyErrorCode.PREFIX_WRONG_FORMAT;
      }

      return null;
    },
  },
  {
    validate: (value: string) => {
      const hasPrefix = value.includes("/");
      const [prefix, name] = hasPrefix ? value.split("/") : ["", value];

      return name ? null : LabelKeyErrorCode.NAME_REQUIRED;
    },
  },
  {
    validate: (value: string) => {
      const hasPrefix = value.includes("/");
      const [prefix, name] = hasPrefix ? value.split("/") : ["", value];

      return validateValueLength(name)
        ? null
        : LabelKeyErrorCode.NAME_OUT_OF_LENGTH;
    },
  },
  {
    validate: (value: string) => {
      const hasPrefix = value.includes("/");
      const [prefix, name] = hasPrefix ? value.split("/") : ["", value];

      return validateValueFormat(name)
        ? null
        : LabelKeyErrorCode.NAME_WRONG_FORMAT;
    },
  },
];

const VALUE_VALIDATORS = [
  {
    validate: (value: string) => {
      return value ? null : LabelValueErrorCode.VALUE_REQUIRED;
    },
  },
  {
    validate: (value: string) => {
      return validateValueLength(value)
        ? null
        : LabelValueErrorCode.VALUE_OUT_OF_LENGTH;
    },
  },
  {
    validate: (value: string) => {
      return validateValueFormat(value)
        ? null
        : LabelValueErrorCode.VALUE_WRONG_FORMAT;
    },
  },
];

export default React.forwardRef<HTMLDivElement, K8sLabelGroupProps>(
  function K8sLabelGroup(props: K8sLabelGroupProps, ref) {
    return (
      <LabelGroup
        ref={ref}
        {...props}
        keyValidators={KEY_VALIDATORS}
        valueValidators={VALUE_VALIDATORS}
      />
    );
  }
);
