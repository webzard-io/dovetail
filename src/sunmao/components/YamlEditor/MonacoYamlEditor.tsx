import { type JSONSchema4 } from "json-schema";
import _ from "lodash";

import * as monaco from "monaco-editor";
import { setDiagnosticsOptions } from "monaco-yaml";
import React, { useEffect, useRef } from "react";
import YamlWorker from "./yaml.worker?worker";

const uri = monaco.Uri.parse("monaco-yaml.yaml");

type Props = {
  defaultValue: string;
  onChange: (val: string) => void;
  onValidate: (valid: boolean, schemaValid: boolean) => void;
  onEditorCreate?: (editor: monaco.editor.ICodeEditor) => void;
  getInstance: (ins: monaco.editor.IStandaloneCodeEditor) => void;
  schema?: JSONSchema4;
};

if (!import.meta.env.PROD) {
  window.MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
      switch (label) {
        // Handle other cases
        case "yaml":
          return new YamlWorker();
        default:
          throw new Error(`Unknown label ${label}`);
      }
    },
  };
}

const MonacoYamlEditor: React.FC<Props> = props => {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<{ editor: monaco.editor.IStandaloneCodeEditor | null }>({ editor: null });
  const { defaultValue, onChange, onValidate, getInstance, onEditorCreate, schema } = props;

  useEffect(() => {
    const model = monaco.editor.createModel(defaultValue, "yaml");
    const editor = monaco.editor.create(ref.current!, {
      automaticLayout: true,
      scrollBeyondLastLine: false,
      model,
    });

    instanceRef.current.editor = editor;
    getInstance(editor);
    onEditorCreate?.(editor);

    return () => {
      instanceRef.current.editor = null;
      model.dispose();
      editor.dispose();
    }
  }, [defaultValue])

  useEffect(() => {
    const stops: monaco.IDisposable[] = [];
    const schemas = schema
      ? [
        {
          // Id of the first schema
          uri: "http://foo.com/foo-schema.json",
          // Associate with our model
          fileMatch: [String(uri)],
          schema,
        },
      ]
      : [];
    // config monaco yaml
    setDiagnosticsOptions({
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      schemas,
    });

    const editor = instanceRef.current.editor;

    if (editor) {
      stops.push(
        editor.onDidChangeModelContent(() => {
          onChange(editor.getValue());
        })
      );

      stops.push(
        monaco.editor.onDidChangeMarkers(() => {
          const marks = monaco.editor.getModelMarkers({ owner: "yaml" });
          const yamlMarks = marks.filter(m => m.source === "YAML");
          const schemaMarks = marks.filter(m => m.source !== "YAML");
          const yamlValid = yamlMarks.length === 0;
          const schemaValid = schemaMarks.length === 0;
          onValidate(yamlValid, schemaValid);
        })
      );
    }

    return () => {
      stops.forEach(stop => stop.dispose());
    };
  }, [onChange, onValidate, schema]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "500px",
      }}
    />
  );
};

export default MonacoYamlEditor;
