import { useTranslation } from "react-i18next";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { WidgetProps } from "./AutoForm/widget";
import { StringUnion } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import { YamlEditorComponent, Handle as EditorHandle } from "../../sunmao/components/YamlEditor/YamlEditorComponent";
import yaml from "js-yaml";
import { debounce } from "lodash";

export const OptionsSpec = Type.Object({
  title: Type.String(),
  isDefaultCollapsed: Type.Boolean(),
});

export type EditorProps = WidgetProps<Record<string, unknown>, Static<typeof OptionsSpec>>;

function Editor(props: EditorProps) {
  const i18n = useTranslation();
  const { spec, field, value, services, displayValues, itemKey, onChange } = props;
  const ref = useRef<EditorHandle>(null);
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  const [isShowErrors, setIsShowErrors] = useState<boolean>(false);

  const onEditorValidate = useCallback((isValid: boolean, isSchemaValid: boolean)=> {
    const currentEditorErrors: string[] = [];

    if (!isValid) {
      currentEditorErrors.push(i18n.t("dovetail.yaml_format_wrong"));
    }

    if (!isSchemaValid) {
      currentEditorErrors.push("dovetail.yaml_value_wrong")
    }

    if (!currentEditorErrors.length) {
      setIsShowErrors(false);
    }

    setEditorErrors(currentEditorErrors);
  }, [i18n]);
  const onValidateEvent = useCallback(()=> {
    setIsShowErrors(!!editorErrors.length);
  }, [editorErrors]);
  const onChangeDebounced = debounce(useCallback((newEditorValue)=> {
    if (!editorErrors.length) {
      const newValue = typeof value === "string" ? newEditorValue : yaml.load(newEditorValue) as Record<string, unknown>;
  
      onChange(newValue, displayValues, itemKey, field?.path);
    }
  }, [value, displayValues, itemKey, field?.path, editorErrors, onChange]), 300);
  const changeValue = useCallback(()=> {
    const currentEditorValue = typeof value === "string" ? value : yaml.dump(value);

    ref.current?.setEditorValue(currentEditorValue);
    ref.current?.setValue(currentEditorValue);
  }, [value]);

  // useEffect(() => {
  //   changeValue();
  // }, [changeValue]);

  useEffect(() => {
    services.event.on("validate", onValidateEvent);

    return () => {
      services.event.off("validate", onValidateEvent);
    };
  }, [services.event, onValidateEvent]);

  return (<YamlEditorComponent
    ref={ref}
    {...props.widgetOptions}
    defaultValue={yaml.dump(field?.defaultValue || "")}
    schema={spec}
    errorMsgs={isShowErrors ? editorErrors : []}
    onChange={onChangeDebounced}
    onValidate={onEditorValidate}
    onEditorCreate={changeValue}
  />)
}

export default Editor;
