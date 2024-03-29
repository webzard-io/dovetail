import React, { useRef, useEffect, useState } from "react";
import { css, cx } from "@emotion/css";
import { CodeEditorProps } from "./kit-context";
import * as monaco from "monaco-editor";

const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (props, ref) => {
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
