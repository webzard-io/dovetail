import * as monaco from "monaco-editor";
import React, { useEffect, useRef } from "react";

type Props = {
  origin: string;
  modified: string;
};

const MonacoYamlDiffEditor: React.FC<Props> = props => {
  const ref = useRef<HTMLDivElement>(null)
  const { origin, modified } = props;
  useEffect(() => {
    const originalModel = monaco.editor.createModel(origin, "yaml");
    const modifiedModel = monaco.editor.createModel(modified, "yaml");

    const diffEditor = monaco.editor.createDiffEditor(ref.current!, {
      renderSideBySide: true,
      originalEditable: false,
      readOnly: true,
      ignoreTrimWhitespace: false,
      scrollBeyondLastLine: false,
    });
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    return () => {
      diffEditor.dispose();
      monaco.editor.getModels().forEach(model => model.dispose());
    };
  }, [modified, origin,]);

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

export default MonacoYamlDiffEditor;
