import React, { useState, useMemo, useRef, useCallback, useImperativeHandle } from "react";
import { YamlEditorComponent, Handle as YamlEditorComponentHandle } from "../../../../sunmao/components/YamlEditor/YamlEditorComponent";
import yaml from "js-yaml";
import useValidate, { UseValidateProps } from "./useValidate";
import { useTranslation } from "react-i18next";
import { WidgetProps } from "../widget";
import { debounce } from "lodash";

export type FormEditorProps = UseValidateProps & Pick<WidgetProps, "onChange" | "displayValues">;

export type FormEditorHandle = {
  validate: (callback: (errorMsgs: string[], newValue: unknown) => void) => void;
}

const FormEditor = React.forwardRef<FormEditorHandle, FormEditorProps>(function FormEditor(props: FormEditorProps, ref) {
  const { value, spec, itemKey, displayValues, field, onChange } = props;
  const { t } = useTranslation();
  const editorRef = useRef<YamlEditorComponentHandle>(null);
  const [editorValue, setEditorValue] = useState(yaml.dump(value));
  const [errors, setErrors] = useState<string[]>([]);
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  const [isShowError, setIsShowError] = useState<boolean>(false);
  const validateValue = useValidate({
    ...props,
    isValidateSubFields: true,
    getValue() {
      return yaml.load(editorValue);
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
  const defaultEditorValue = useMemo(() => yaml.dump(props.field?.defaultValue || {}), [props.field?.defaultValue]);

  const validate = useCallback((callback: (errorMsgs: string[], newValue: unknown) => void) => {
    if (editorErrors.length) {
      setIsShowError(true);
      callback(editorErrors, value);
    } else {
      validateValue((errorsMsgs, newValue) => {
        setErrors(errorsMsgs);
        callback([...editorErrors, ...errorsMsgs], newValue);
      });
    }
  }, [validateValue, editorErrors, value]);
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
  const onChangeDebounced = debounce(useCallback((newVal) => {
    if (!(editorErrors.length || errors.length)&& newVal !== editorValue) {
      onChange(yaml.load(newVal), displayValues, itemKey, field?.path);
    }
  }, [onChange, displayValues, itemKey, field?.path, editorErrors, errors, editorValue]));
  const onEditorValueChange = useCallback((newVal: string) => {
    setEditorValue(newVal);
    onChangeDebounced(newVal);
  }, [onChangeDebounced]);
  const changeValue = useCallback(()=> {
    const currentEditorValue = yaml.dump(value);

    if (currentEditorValue !== editorRef.current?.getEditorValue()) {
      setEditorValue(currentEditorValue);
      editorRef.current?.setEditorValue(currentEditorValue);
      editorRef.current?.setValue(currentEditorValue);
    }
  }, [value]);

  useImperativeHandle(ref, () => {
    return {
      validate,
    }
  });

  // useEffect(() => {
  //   changeValue();
  // }, [changeValue]);

  return (
    <YamlEditorComponent
      ref={editorRef}
      defaultValue={defaultEditorValue}
      schema={spec}
      errorMsgs={isShowError ? [...editorErrors, ...errors] : []}
      onChange={onEditorValueChange}
      onValidate={onEditorValidate}
      onEditorCreate={changeValue}
    />
  )
});

export default FormEditor;
