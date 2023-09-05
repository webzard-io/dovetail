import React, { useRef, useEffect, useState } from "react";
import { css, cx } from "@emotion/css";
import * as monaco from "monaco-editor";

type RefAndChildren = {
  children?: React.ReactNode;
  ref?: React.Ref<any> | null;
};

export type CodeEditorProps = {
  className?: string;
  defaultValue?: string;
  language?: string;
  minimap?: boolean;
  onChange?: (newValue: string) => void;
  onBlur?: (newValue: string) => void;
} & RefAndChildren;

const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  function CodeEditor(props, ref) {
    const { defaultValue, minimap, language, className, onChange, onBlur } =
      props;
    const [value, setValue] = useState(defaultValue);
    const elRef = useRef<HTMLDivElement | null>(null);

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
