import React, { useRef, useEffect, useState } from "react";
import { css, cx } from "@emotion/css";
import { CodeEditorProps } from "./kit-context";
// import * as monaco from "monaco-editor";
// import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

// (self as any).MonacoEnvironment = {
//   getWorker(_: unknown, label: string) {
//     if (label === "json") {
//       return new jsonWorker();
//     }
//     // if (label === "css" || label === "scss" || label === "less") {
//     //   return new cssWorker();
//     // }
//     // if (label === "html" || label === "handlebars" || label === "razor") {
//     //   return new htmlWorker();
//     // }
//     // if (label === "typescript" || label === "javascript") {
//     //   return new tsWorker();
//     // }
//     return new editorWorker();
//   },
// };

const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (props, ref) => {
    const { defaultValue, minimap, language, className, onChange, onBlur } =
      props;
    const [value, setValue] = useState(defaultValue);
    const elRef = useRef<HTMLDivElement | null>(null);
    // useEffect(() => {
    //   if (ref && typeof ref === "object") {
    //     elRef.current = ref?.current || null;
    //   }
    //   if (!elRef.current) {
    //     return;
    //   }
    //   const editor = monaco.editor.create(elRef.current, {
    //     value: defaultValue,
    //     language,
    //     minimap: {
    //       enabled: minimap,
    //     },
    //   });
    //   editor.onDidChangeModelContent(() => {
    //     const newValue = editor.getValue();
    //     setValue(newValue);
    //     onChange?.(newValue);
    //   });
    //   editor.onDidBlurEditorText(() => {
    //     const newValue = editor.getValue();
    //     onBlur?.(newValue);
    //   });
    //   return () => {
    //     editor.dispose();
    //     const model = editor.getModel();
    //     if (model) {
    //       model.dispose();
    //     }
    //   };
    // }, [language, minimap, setValue]);

    return (
      <div
        ref={ref || elRef}
        className={cx(
          css`
            height: 500px;
          `,
          className
        )}
      />
    );
  }
);

export default CodeEditor;
