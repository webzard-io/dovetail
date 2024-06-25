import React, { useRef, useEffect, useState } from "react";
import { css, cx } from "@linaria/core";
import { CodeEditorProps } from "src/_internal/atoms/kit-context";

import "monaco-editor/esm/vs/editor/editor.all.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const MonacoEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (props, ref) => {
    const { defaultValue, minimap, language, className, onChange, onBlur } =
      props;
    const [value, setValue] = useState(defaultValue);
    const elRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (ref && typeof ref === "object") {
        elRef.current = ref?.current || null;
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
      editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue();
        setValue(newValue);
        onChange?.(newValue);
      });
      editor.onDidBlurEditorText(() => {
        const newValue = editor.getValue();
        onBlur?.(newValue);
      });
      return () => {
        editor.dispose();
        const model = editor.getModel();
        if (model) {
          model.dispose();
        }
      };
    }, [language, minimap, setValue]);

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

export default MonacoEditor;
