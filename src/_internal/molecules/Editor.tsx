import { useTranslation } from "react-i18next";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { WidgetProps } from "./AutoForm/widget";
import { Type, Static } from "@sinclair/typebox";
import { YamlEditorComponent, Handle as EditorHandle } from "../../sunmao/components/YamlEditor/YamlEditorComponent";
import yaml from "js-yaml";

export const OptionsSpec = Type.Object({
  title: Type.String(),
  isDefaultCollapsed: Type.Boolean(),
});

export type EditorProps = WidgetProps<Record<string, unknown> | string, Static<typeof OptionsSpec>>;

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
  const onBlur = useCallback(()=> {
    if (!editorErrors.length) {
      const editorValue = ref.current?.getEditorValue() || "";
      const newValue = typeof value === "string" ? editorValue : yaml.load(editorValue) as Record<string, unknown>;
      
      onChange(newValue, displayValues, itemKey, field?.path);
    }
  }, [displayValues, editorErrors, itemKey, field?.path, value, onChange])
  const changeValue = useCallback(()=> {
    const currentEditorValue = typeof value === "string" ? value : yaml.dump(value);

    ref.current?.setEditorValue(currentEditorValue);
    ref.current?.setValue(currentEditorValue);
  }, [value]);

  useEffect(() => {
    changeValue();
  }, [changeValue]);

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
    onValidate={onEditorValidate}
    onEditorCreate={changeValue}
    onBlur={onBlur}
  />)
}

export default Editor;
