import React, { useImperativeHandle } from "react";
import { YamlEditorComponent } from "../../../../sunmao/components/YamlEditor/YamlEditorComponent";
import { UseValidateProps } from "./useValidate";
import { WidgetProps } from "../widget";
import useEditor from "../../../hooks/useEditor";

export type FormEditorProps = UseValidateProps & Pick<WidgetProps, "onChange" | "displayValues">;

export type FormEditorHandle = {
  validate: (callback: (errorMsgs: string[], newValue: unknown) => void) => void;
}

const FormEditor = React.forwardRef<FormEditorHandle, FormEditorProps>(function FormEditor(props: FormEditorProps, ref) {
  const { spec, itemKey, field, } = props;
  const {
    ref: editorRef,
    finalErrors,
    defaultValue,
    validate,
    changeValue,
    onChangeOrBlur,
    onEditorValidate,
  } = useEditor(props);

  useImperativeHandle(ref, () => {
    return {
      validate,
    }
  });

  return (
    <YamlEditorComponent
      ref={editorRef}
      id={itemKey}
      defaultValue={defaultValue}
      schema={spec}
      height={field?.editorHeight}
      errorMsgs={finalErrors}
      onChange={onChangeOrBlur}
      onValidate={onEditorValidate}
      onEditorCreate={changeValue}
      onBlur={onChangeOrBlur}
    />
  )
});

export default FormEditor;
