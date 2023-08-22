import { useTranslation } from "react-i18next";
import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { WidgetProps } from "./AutoForm/widget";
import { Type, Static } from "@sinclair/typebox";
import { YamlEditorComponent, Handle as EditorHandle } from "../../sunmao/components/YamlEditor/YamlEditorComponent";
import { Events } from "../organisms/KubectlApplyForm/type";
import yaml from "js-yaml";
import { isEqual } from "lodash";
import SectionTitle from "../molecules/AutoForm/SpecField/SectionTitle";

export const OptionsSpec = Type.Object({
  title: Type.String(),
  height: Type.String(),
  isDefaultCollapsed: Type.Boolean(),
  formatError: Type.String(),
  schemaError: Type.String(),
  sectionTitle: Type.String(),
});

export type EditorProps = WidgetProps<Record<string, unknown> | string, Static<typeof OptionsSpec>>;

function Editor(props: EditorProps) {
  const i18n = useTranslation();
  const { spec, field, value, services, displayValues, itemKey, onChange } = props;
  const ref = useRef<EditorHandle>(null);
  const [editorErrors, setEditorErrors] = useState<string[]>([]);
  const [isShowErrors, setIsShowErrors] = useState<boolean>(false);
  const schema = useMemo(() => ["object", "array"].includes(spec.type as string) ? spec : undefined, [spec]);
  const defaultValue = useMemo(
    () => {
      if (field?.defaultValue === undefined) return "";

      return typeof field?.defaultValue === "string" ? field?.defaultValue || "" : yaml.dump(field?.defaultValue || {});
    },
    [field?.defaultValue]
  );

  const onEditorValidate = useCallback((isValid: boolean, isSchemaValid: boolean) => {
    const currentEditorErrors: string[] = [];

    if (!isValid) {
      currentEditorErrors.push(props.widgetOptions?.formatError || i18n.t("dovetail.yaml_format_wrong"));
    }

    if (!isSchemaValid) {
      currentEditorErrors.push(props.widgetOptions?.schemaError || i18n.t("dovetail.yaml_value_wrong"))
    }

    if (!currentEditorErrors.length) {
      setIsShowErrors(false);
    }

    setEditorErrors(currentEditorErrors);
  }, [i18n]);
  const onValidateEvent = useCallback(({ result }: Events["validate"]) => {
    result[itemKey] = editorErrors;
    setIsShowErrors(!!editorErrors.length);
  }, [editorErrors, itemKey]);
  const emitChange = useCallback(() => {
    if (!editorErrors.length) {
      const editorValue = ref.current?.getEditorValue() || "";
      const newValue = typeof value === "string" ? editorValue : yaml.load(editorValue) as Record<string, unknown>;

      onChange(newValue, displayValues, itemKey, field?.path);
    }
  }, [displayValues, editorErrors, itemKey, field?.path, value, onChange]);
  const changeValue = useCallback(() => {

    if (typeof value === "string") {
      if (value !== ref.current?.getEditorValue()) {
        ref.current?.setEditorValue(value);
        ref.current?.setValue(value);
      }
    } else {
      const valueFromEditor = yaml.load(ref.current?.getEditorValue() || "");

      if (!isEqual(value, valueFromEditor)) {
        const newEditorValue = typeof value === "string" ? value : yaml.dump(value);

        ref.current?.setEditorValue(newEditorValue);
        ref.current?.setValue(newEditorValue);
      }
    }
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

  return (<>
    {props.widgetOptions?.sectionTitle && <SectionTitle
      sectionTitle={props.widgetOptions?.sectionTitle}
      isDisplayEditorSwitch
      isEnableEditor
      isDisabledSwitchEditor
    />}
    <YamlEditorComponent
      ref={ref}
      {...props.widgetOptions}
      id={itemKey}
      defaultValue={defaultValue}
      schema={schema}
      errorMsgs={isShowErrors ? editorErrors : []}
      onValidate={onEditorValidate}
      onEditorCreate={changeValue}
      onChange={emitChange}
      onBlur={emitChange}
    />
  </>)
}

export default Editor;
