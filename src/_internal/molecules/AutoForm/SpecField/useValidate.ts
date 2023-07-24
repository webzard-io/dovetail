import { useEffect, useMemo, useCallback } from "react";
import { get } from "lodash";
import Schema, { ValidateError, RuleType } from "async-validator";
import { JSONSchema7 } from "json-schema";
import { WidgetProps } from "../widget";
import { Field, Services, Events } from "../../../organisms/KubectlApplyForm/type";
import registry from "../../../../services/Registry";
import { getJsonSchemaByPath } from "../../../utils/schema";

export type UseValidateProps = {
  field?: Field;
  item?: Field["subItem"];
  spec: WidgetProps["spec"];
  value?: any;
  getValue?: () => unknown;
  itemKey: string;
  services: Services;
  layout?: "horizontal" | "vertical";
  error?: string;
  widgetErrors: string[];
  onValidate?: (errors: string[]) => void;
  isValidateSubFields?: boolean;
  beforeValidateEvent?: (result: Record<string, string[]>) => boolean;
}

export default function useValidate(props: UseValidateProps) {
  const {
    field,
    spec,
    item,
    value,
    getValue,
    itemKey,
    services,
    error,
    widgetErrors,
    isValidateSubFields,
    onValidate: onValidateFn,
    beforeValidateEvent
  } = props;
  const fieldOrItem = field || item;
  const getRules = (fieldOrItem: Field | Field["subItem"], fieldSpec?: JSONSchema7 | null) => (fieldOrItem?.disabledValidation
    ? []
    : fieldOrItem?.rules?.map((rule) => ({
      ...rule,
      validator:
        typeof rule.validatorType === "string" &&
          registry.validators.has(rule.validatorType)
          ? registry.validators.get(rule.validatorType)
          : rule.validator,
      type: (fieldSpec?.type || undefined) as RuleType,
      pattern: rule.pattern ? new RegExp(rule.pattern, "g") : undefined,
    })) || []
  )
  const validator = useMemo(
    () => {
      const rules = {
        value: getRules(fieldOrItem, spec),
        ...(isValidateSubFields ? field?.fields?.reduce((result: Record<string, ReturnType<typeof getRules>>, subField) => {
          if (subField.key) {
            result[subField.key] = getRules(subField, getJsonSchemaByPath(spec, subField?.path));
          }

          return result;
        }, {}) : {})
      };

      return new Schema(rules)
    },
    [fieldOrItem, spec, field?.fields, isValidateSubFields]
  );

  const validate = useCallback(
    (callback?: (messages: string[], validatedValue?: unknown) => void) => {
      const validatedValue = getValue ? getValue() : value;
      const finalValue = {
        value: validatedValue, ...(isValidateSubFields ? field?.fields?.reduce((result: Record<string, unknown>, subField) => {
          if (subField.key) {
            result[subField.key] = get(validatedValue, subField.path);
          }

          return result;
        }, {}) : {})
      };

      validator.validate(finalValue, {}, (newErrors: ValidateError[]) => {
        const newErrorsMessages = (newErrors || []).map(
          ({ message }) => message
        );

        onValidateFn?.(newErrorsMessages);
        callback?.(newErrorsMessages, validatedValue);
      });
    },
    [validator, value, onValidateFn, field?.fields, getValue, isValidateSubFields]
  );
  const onValidate = useCallback(
    ({ result }: Events["validate"]) => {
      const shouldValidateValue = beforeValidateEvent?.(result) ?? true;

      if (shouldValidateValue) {
        validate((messages: string[]) => {
          result[itemKey] = error
            ? messages.concat(error, widgetErrors)
            : messages;
        });
      }
    },
    [itemKey, error, widgetErrors, validate, beforeValidateEvent]
  );

  useEffect(() => {
    services.event.on("validate", onValidate);

    return () => {
      services.event.off("validate", onValidate);
    };
  }, [services.event, onValidate]);

  return validate;
}
