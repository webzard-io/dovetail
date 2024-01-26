import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import useValidate, { UseValidateProps } from "../molecules/AutoForm/SpecField/useValidate";
import { WidgetProps } from "../molecules/AutoForm/widget";
import { useTranslation } from "react-i18next";
import yaml from "js-yaml";
import { Handle as YamlEditorComponentHandle } from "../../sunmao/components/YamlEditor/YamlEditorComponent";
import { isEqual } from "lodash";
import { Field } from "../organisms/KubectlApplyForm/type";

export type UseEditorProps = UseValidateProps & Pick<WidgetProps, "onChange" | "displayValues"> & {
  formatErrorMessage?: string;
  schemaErrorMessage?: string;
};

function useEditor(props: UseEditorProps) {
  const { field, value, displayValues, itemKey, formatErrorMessage, schemaErrorMessage, onChange } = props;
  const { i18n } = useTranslation();
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isShowErrors, setIsShowErrors] = useState<boolean>(false);
  const ref = useRef<YamlEditorComponentHandle>(null);

  const filedErrors: string[] = useMemo(() => {
    function getFieldError(error?: Field["error"]): string[] {
      if (error instanceof Array) {
        return error || [];
      } else if (error instanceof Object) {
        return Object.values(error);
      } else {
        return error ? [error] : [];
      }
    }

    return ([] as string[])
      .concat(getFieldError(field?.error))
      .concat(
        field?.fields?.map((subField) =>
          getFieldError(subField?.error)
        )?.flat() || []
      )
      .filter(error => error);
  }, [field]);
  const finalErrors = useMemo(() => {
    return isShowErrors ? [...new Set([...editorErrors, ...errors, ...filedErrors])] : [];
  }, [isShowErrors, editorErrors, errors, filedErrors]);
  const defaultValue = useMemo(
    () => {
      if (field?.defaultValue === undefined) return "";

      return typeof field?.defaultValue === "string" ? field?.defaultValue || "" : yaml.dump(field?.defaultValue || {}, { lineWidth: Number.MAX_SAFE_INTEGER });
    },
    [field?.defaultValue]
  );

  const validateValue = useValidate({
    ...props,
    isValidateSubFields: true,
    getValue() {
      return yaml.load(ref.current?.getEditorValue() || "");
    },
    onValidate(errors) {
      setIsShowErrors(!![...errors, ...filedErrors, ...editorErrors].length);
      setErrors(errors);
    },
    beforeValidateEvent(result) {
      if (editorErrors.length || filedErrors.length) {
        result[itemKey] = [...editorErrors, ...filedErrors];
        setIsShowErrors(true);
      }

      return !editorErrors.length;
    },
  });

  const emitChange = useCallback(() => {
    const editorValue = ref.current?.getEditorValue() || "";
    const newValue = typeof value === "string" ? editorValue : yaml.load(editorValue) as Record<string, unknown>;

    onChange(newValue, displayValues, itemKey, field?.path);
  }, [displayValues, itemKey, field?.path, value, onChange]);
  const changeValue = useCallback(() => {
    if (typeof value === "string") {
      if (value !== ref.current?.getEditorValue()) {
        ref.current?.setEditorValue(value);
        ref.current?.setValue(value);
      }
    } else {
      const valueFromEditor = yaml.load(ref.current?.getEditorValue() || "");

      if (!isEqual(value, valueFromEditor)) {
        const newEditorValue = typeof value === "string" ? value : yaml.dump(value, { lineWidth: Number.MAX_SAFE_INTEGER });

        ref.current?.setEditorValue(newEditorValue);
        ref.current?.setValue(newEditorValue);
      }
    }
  }, [value]);
  const onEditorValidate = useCallback((isValid: boolean, isSchemaValid: boolean) => {
    const currentEditorErrors: string[] = [];

    if (!isValid) {
      currentEditorErrors.push(formatErrorMessage || i18n.t("dovetail.yaml_format_wrong"));
    }

    if (!isSchemaValid) {
      currentEditorErrors.push(schemaErrorMessage || i18n.t("dovetail.yaml_value_wrong"))
    }

    if (!currentEditorErrors.length) {
      if (editorErrors.length) {
        // if the editor errors are fixed, then emit the value
        emitChange();
      }

      setIsShowErrors(false);
    }

    setEditorErrors(currentEditorErrors);
  }, [i18n, formatErrorMessage, schemaErrorMessage, editorErrors.length, emitChange]);
  const validate = useCallback((callback: (errorMsgs: string[], newValue: unknown) => void) => {
    if (editorErrors.length || filedErrors.length) {
      setIsShowErrors(true);
      callback([...editorErrors, ...filedErrors], value);
    } else {
      validateValue((errorsMsgs, newValue) => {
        setErrors(errorsMsgs);
        callback([...editorErrors, ...errorsMsgs, ...filedErrors], newValue);
      });
    }
  }, [validateValue, editorErrors, filedErrors, value]);
  const onChangeOrBlur = useCallback(() => {
    if (!editorErrors.length) {
      emitChange();
    }
  }, [emitChange, editorErrors.length]);

  useEffect(() => {
    changeValue();
  }, [changeValue]);
  useEffect(() => {
    if (!editorErrors.length && errors.length) {
      validate((errorMsgs) => {
        setErrors(errorMsgs);
      });
    }

    // only trigger when the value or editorErrors is changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editorErrors.length]);

  return {
    ref,
    finalErrors,
    defaultValue,
    changeValue,
    validate,
    onEditorValidate,
    onChangeOrBlur
  }
}

export default useEditor;

