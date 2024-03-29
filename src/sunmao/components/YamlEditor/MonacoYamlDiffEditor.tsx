import * as monaco from "monaco-editor";
import React, { useEffect, useRef } from "react";
import { YamlDiffEditorStyle } from "./style";

type Props = {
  id?: string;
  origin: string;
  height?: string;
  modified: string;
};

const MonacoYamlDiffEditor: React.FC<Props> = props => {
  const ref = useRef<HTMLDivElement>(null)
  const { origin, modified, id, height } = props;
  useEffect(() => {
    const originalUri = id ? monaco.Uri.parse(`${id}_original.yaml`) : undefined;
    const modifiedUri = id ? monaco.Uri.parse(`${id}_modified.yaml`) : undefined;
    const originalModel = monaco.editor.createModel(origin, "yaml", originalUri);
    const modifiedModel = monaco.editor.createModel(modified, "yaml", modifiedUri);

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
      originalModel.dispose();
      modifiedModel.dispose();
    };
  }, [modified, origin, id]);

  return (
    <div
      ref={ref}
      className={YamlDiffEditorStyle}
      style={{
        width: "100%",
        height: height || "500px",
      }}
    />
  );
};

export default MonacoYamlDiffEditor;
