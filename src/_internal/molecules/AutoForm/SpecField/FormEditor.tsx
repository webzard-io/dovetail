import React, { useState, useMemo, useRef, useCallback, useImperativeHandle, useEffect } from "react";
import { YamlEditorComponent, Handle as YamlEditorComponentHandle } from "../../../../sunmao/components/YamlEditor/YamlEditorComponent";
import yaml from "js-yaml";
import useValidate, { UseValidateProps } from "./useValidate";
import { useTranslation } from "react-i18next";
import { WidgetProps } from "../widget";
import { debounce, isEqual } from "lodash";
import { Field } from "../../../organisms/KubectlApplyForm/type";

export type FormEditorProps = UseValidateProps & Pick<WidgetProps, "onChange" | "displayValues">;

export type FormEditorHandle = {
  validate: (callback: (errorMsgs: string[], newValue: unknown) => void) => void;
}

const FormEditor = React.forwardRef<FormEditorHandle, FormEditorProps>(function FormEditor(props: FormEditorProps, ref) {
  const { value, spec, itemKey, displayValues, field, item, onChange } = props;
  const fieldOrItem = field || item;
  const { t } = useTranslation();
  const editorRef = useRef<YamlEditorComponentHandle>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  const [isShowError, setIsShowError] = useState<boolean>(false);
  const [objectValue, setObjectValue] = useState(props.field?.defaultValue || {});
  const validateValue = useValidate({
    ...props,
    isValidateSubFields: true,
    getValue() {
      return yaml.load(editorRef.current?.getEditorValue() || "");
    },
    onValidate(errors) {
      setIsShowError(!!errors.length);
      setErrors(errors);
    },
    beforeValidateEvent(result) {
      if (editorErrors.length) {
        result[itemKey] = editorErrors;
        setIsShowError(true);
      }

      return !editorErrors.length;
    },
  });
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
      .filter(error=> error);
  }, [field]);
  const finalErrors = useMemo(() => {
    return isShowError ? [...new Set([...editorErrors, ...errors, ...filedErrors])] : [];
  }, [isShowError, editorErrors, errors, filedErrors]);
  const defaultEditorValue = useMemo(() => yaml.dump(props.field?.defaultValue || {}), [props.field?.defaultValue]);

  const validate = useCallback((callback: (errorMsgs: string[], newValue: unknown) => void) => {
    if (editorErrors.length || filedErrors.length) {
      setIsShowError(true);
      callback([...editorErrors, ...filedErrors], value);
    } else {
      validateValue((errorsMsgs, newValue) => {
        setErrors(errorsMsgs);
        callback([...editorErrors, ...errorsMsgs, ...filedErrors], newValue);
      });
    }
  }, [validateValue, editorErrors, filedErrors, value]);
  const onEditorValidate = useCallback((isValid, isSchemaValid) => {
    const errorMsgs: string[] = [];

    if (!isValid) {
      errorMsgs.push(t("dovetail.yaml_format_wrong"));
    }

    if (!isSchemaValid) {
      errorMsgs.push(t("dovetail.yaml_value_wrong"));
    }

    setEditorErrors(errorMsgs);
  }, [t]);
  const emitChange = useCallback(() => {
    if (!editorErrors.length) {
      const result = yaml.load(editorRef.current?.getEditorValue() || "") as Record<string, unknown>;

      setObjectValue(result);
      onChange(result, displayValues, itemKey, field?.path);
    }
  }, [onChange, displayValues, itemKey, field?.path, editorErrors])
  const debouncedEmitChange = debounce(useCallback(() => {
    emitChange();
  }, [emitChange]), 200);
  const onBlur = useCallback(() => {
    emitChange();
  }, [emitChange])
  const changeValue = useCallback(() => {
    const currentEditorValue = yaml.dump(value);

    if (currentEditorValue !== editorRef.current?.getEditorValue()) {
      editorRef.current?.setEditorValue(currentEditorValue);
      editorRef.current?.setValue(currentEditorValue);
    }
  }, [value]);

  useImperativeHandle(ref, () => {
    return {
      validate,
    }
  });

  useEffect(() => {
    if (!isEqual(value, objectValue)) {
      setObjectValue(value);
      changeValue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  useEffect(() => {
    if (!editorErrors.length && errors.length) {
      validate((errorMsgs) => {
        setErrors(errorMsgs);
      });
    }
    // only trigger validate when value of field changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldOrItem, value]);

  return (
    <YamlEditorComponent
      ref={editorRef}
      id={itemKey}
      defaultValue={defaultEditorValue}
      schema={spec}
      errorMsgs={finalErrors}
      onChange={emitChange}
      onValidate={onEditorValidate}
      onEditorCreate={changeValue}
      onBlur={onBlur}
    />
  )
});

export default FormEditor;
