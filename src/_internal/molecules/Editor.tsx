import React, { useMemo } from "react";
import { WidgetProps } from "./AutoForm/widget";
import { Type, Static } from "@sinclair/typebox";
import { YamlEditorComponent } from "../../sunmao/components/YamlEditor/YamlEditorComponent";
import SectionTitle from "../molecules/AutoForm/SpecField/SectionTitle";
import useEditor from "../hooks/useEditor";

export const OptionsSpec = Type.Object({
  title: Type.String(),
  height: Type.String(),
  isDefaultCollapsed: Type.Boolean(),
  formatError: Type.String(),
  schemaError: Type.String(),
  sectionTitle: Type.String(),
  readOnly: Type.Boolean(),
});

export type EditorProps = WidgetProps<Record<string, unknown> | string, Static<typeof OptionsSpec>>;

function Editor(props: EditorProps) {
  const { spec, error, itemKey } = props;
  const {
    ref,
    finalErrors,
    defaultValue,
    changeValue,
    onChangeOrBlur,
    onEditorValidate,
  } = useEditor({
    ...props,
    error: typeof error === "string" ? error : "",
  });
  const schema = useMemo(() => ["object", "array"].includes(spec.type as string) ? spec : undefined, [spec]);

  return (<>
    {props.widgetOptions?.sectionTitle && <SectionTitle
      sectionTitle={props.widgetOptions?.sectionTitle}
      className="editor-switch-section-title"
    />}
    <YamlEditorComponent
      ref={ref}
      {...props.widgetOptions}
      id={itemKey}
      defaultValue={defaultValue}
      schema={schema}
      errorMsgs={finalErrors}
      onValidate={onEditorValidate}
      onEditorCreate={changeValue}
      onChange={onChangeOrBlur}
      onBlur={onChangeOrBlur}
    />
  </>)
}

export default Editor;
