import React, { useContext } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import BaseCodeEditor from "../../_internal/atoms/CodeEditor";

const CodeEditorProps = Type.Object({
  defaultValue: Type.String(),
  language: Type.String(),
  minimap: Type.Boolean(),
});

const CodeEditorState = Type.Object({});

export const CodeEditor = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "code_editor",
    displayName: "Code Editor",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      defaultValue: "console.log('hello world')",
      language: "javascript",
    },
    exampleSize: [4, 8],
    annotations: {
      category: "Input",
    },
  },
  spec: {
    properties: CodeEditorProps,
    state: CodeEditorState,
    methods: {},
    slots: {},
    styleSlots: ["editor"],
    events: [],
  },
})(({ defaultValue, language, minimap, elementRef, customStyle }) => {
  return (
    <BaseCodeEditor
      ref={elementRef}
      defaultValue={defaultValue}
      language={language}
      minimap={minimap}
      className={css`
        ${customStyle}
      `}
    />
  );
});
