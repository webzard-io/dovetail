import { type JSONSchema4 } from "json-schema";
import _ from "lodash";

import * as monaco from "monaco-editor";
import { setDiagnosticsOptions } from "monaco-yaml";
import React, { useEffect, useRef } from "react";
import YamlWorker from "./yaml.worker?worker";

const uri = monaco.Uri.parse("monaco-yaml.yaml");

type Props = {
  id?: string;
  defaultValue: string;
  height?: string;
  onChange: (val: string) => void;
  onValidate: (valid: boolean, schemaValid: boolean) => void;
  onEditorCreate?: (editor: monaco.editor.ICodeEditor) => void;
  onBlur?: () => void;
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

const schemaMap = new Map();

const MonacoYamlEditor: React.FC<Props> = props => {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<{ editor: monaco.editor.IStandaloneCodeEditor | null }>({ editor: null });
  const { defaultValue, id, height, onChange, onValidate, getInstance, onEditorCreate, onBlur, schema } = props;
  const uri = id ? monaco.Uri.parse(`${id}.yaml`) : undefined;

  useEffect(() => {
    if (schema) {
      schemaMap.set(id, {
        // Id of the first schema
        uri: String(uri),
        // Associate with our model
        fileMatch: uri ? [String(uri)] : [],
        schema,
      });
    }
    const schemas = [...schemaMap.values()];
    // config monaco yaml
    setDiagnosticsOptions({
      enableSchemaRequest: false,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      isKubernetes: true,
      schemas,
    });

    const model = monaco.editor.createModel(defaultValue, "yaml", uri);
    const editor = monaco.editor.create(ref.current!, {
      automaticLayout: true,
      scrollBeyondLastLine: false,
      model,
      scrollbar: {
        handleMouseWheel: false,
      },
      tabSize: 2,
    });

    instanceRef.current.editor = editor;
    getInstance(editor);
    onEditorCreate?.(editor);

    return () => {
      instanceRef.current.editor = null;
      schemaMap.delete(id);
      model.dispose();
      editor.dispose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, schema, id, getInstance]);

  useEffect(() => {
    const editor = instanceRef.current.editor;

    if (editor) {
      const stop = editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      return () => {
        stop.dispose();
      }
    }
  }, [onChange, instanceRef.current.editor]);

  useEffect(() => {
    const editor = instanceRef.current.editor;

    if (editor) {
      const stop = monaco.editor.onDidChangeMarkers((uri) => {
        const currentEditorUri = instanceRef.current.editor?.getModel()?.uri;

        if (uri.toString() === currentEditorUri?.toString()) {
          const marks = monaco.editor.getModelMarkers({ owner: "yaml", resource: currentEditorUri  });
          const yamlMarks = marks.filter(m => m.source === "YAML");
          const schemaMarks = marks.filter(m => m.source !== "YAML");
          const yamlValid = yamlMarks.length === 0;
          const schemaValid = schemaMarks.length === 0;

          onValidate(yamlValid, schemaValid);
        }
      })

      return () => {
        stop.dispose();
      };
    }

  }, [onValidate, instanceRef.current.editor]);

  useEffect(() => {
    const editor = instanceRef.current.editor;

    if (editor) {
      const stop = editor.onDidBlurEditorWidget(() => {
        onBlur?.();
      });

      return () => {
        stop.dispose();
      };
    }
  }, [onBlur, instanceRef.current.editor]);

  useEffect(() => {
    const editor = instanceRef.current.editor;
    const stops: monaco.IDisposable[] = [];

    if (editor) {
      stops.push(editor.onDidFocusEditorWidget(() => {
        editor.updateOptions({
          scrollbar: {
            handleMouseWheel: true,
          }
        })
      }));
      stops.push(editor.onDidBlurEditorWidget(() => {
        editor.updateOptions({
          scrollbar: {
            handleMouseWheel: false,
          }
        })
      }));
    }

    return () => {
      stops.forEach(stop => stop.dispose());
    }
  }, [instanceRef.current.editor])

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: height || "500px",
      }}
    />
  );
};

export default MonacoYamlEditor;
