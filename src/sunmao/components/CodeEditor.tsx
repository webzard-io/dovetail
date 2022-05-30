import React, { useRef, useEffect } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

(self as any).MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

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
  const elRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof elementRef === "object") {
      elRef.current = elementRef?.current;
    }
    if (!elRef.current) {
      return;
    }
    const editor = monaco.editor.create(elRef.current, {
      value: defaultValue,
      language,
      minimap: {
        enabled: minimap,
      },
    });
    return () => {
      editor.dispose();
      const model = editor.getModel();
      if (model) {
        model.dispose();
      }
    };
  }, [defaultValue, language, minimap]);
  return (
    <div
      ref={elementRef}
      className={css`
        height: 500px;
        ${customStyle?.editor}
      `}
    />
  );
});
