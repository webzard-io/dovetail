import { KitContext } from "../../../_internal/atoms/kit-context";
import {
  ClipboardCopy16GradientGrayIcon,
  HierarchyTriangleRight16GrayIcon,
  Retry16GradientGrayIcon,
  XmarkFailedSeriousWarningFill16RedIcon,
  EditPen16Icon,
  Showdiff16Icon,
} from "@cloudtower/icons-react";
import { Type, Static } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import type * as monaco from "monaco-editor";
import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useTranslation } from "react-i18next";
import { Seperator } from "../../../_internal/components/Seperator";
import { css as ecss, cx } from "@emotion/css";
import {
  ErrorMsgStyle,
  IconStyle,
  PlainCodeStyle,
  TitleStyle,
  ToolBarStyle,
  ToolBarHeaderStyle,
  ErrorIconStyle,
  WrapperStyle,
  ErrorWrapperStyle,
} from "./style";

const PropsSchema = Type.Object({
  title: Type.String(),
  defaultValue: Type.String(),
  errorMsgs: Type.Array(Type.String()),
  schema: Type.Optional(Type.Record(Type.String(), Type.Any())),
});
const StateSchema = Type.Object({
  value: Type.String(),
  isValid: Type.Boolean(),
  isSchemaValid: Type.Boolean(),
});
const MonacoYamlEditor = React.lazy(() => import("./MonacoYamlEditor"));
const MonacoYamlDiffEditor = React.lazy(() => import("./MonacoYamlDiffEditor"));

const initCode = `
version: sunmao/v1
kind: Application
metadata:
  name: some App
spec:
  components:
    - id: yaml_editor0
      type: cloudtower/v1/yaml_editor
      properties: {}
      traits: []
`;

export type Props = Partial<Static<typeof PropsSchema>> & {
  eleRef?: React.MutableRefObject<HTMLDivElement>;
  className?: string;
  isDefaultCollapsed?: boolean;
  onChange?: (value: string) => void;
  onValidate?: (valid: boolean, schemaValid: boolean) => void;
  onEditorCreate?: (editor: monaco.editor.ICodeEditor)=> void;
  onBlur?: ()=> void;
}

export type Handle = {
  setValue: (value: string) => void;
  setEditorValue: (value: string) => void;
  getEditorValue: () => string;
}

export const YamlEditorComponent = forwardRef<Handle, Props>(function YamlEditorComponent(props, ref) {
  const { title, isDefaultCollapsed, defaultValue = "", errorMsgs = [], schema, eleRef, className } = props;
  const kit = useContext(KitContext);
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(isDefaultCollapsed);
  const [isDiff, setIsDiff] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor>();

  useImperativeHandle(ref, () => {
    return {
      setValue,
      setEditorValue: (value: string) => {
        editorInstance.current?.getModel()?.setValue(value);
      },
      getEditorValue: () => {
        return editorInstance.current?.getValue() || "";
      }
    };
  });

  const onChange = useCallback(
    (newVal: string) => {
      setValue(newVal);
      props.onChange?.(newVal);
    },
    [props.onChange]
  );

  const onValidate = useCallback(
    (valid: boolean, schemaValid: boolean) => {
      props.onValidate?.(valid, schemaValid);
    },
    [props.onValidate]
  );

  const getInstance = useCallback((ins: monaco.editor.IStandaloneCodeEditor): void => {
    editorInstance.current = ins;
  }, []);

  return (
    <div
      className={cx(WrapperStyle, className)}
      data-is-error={!!errorMsgs.length}
      ref={eleRef}
    >
      <kit.Space className={ToolBarStyle} direction="vertical" size={0}>
        <kit.Space className={ToolBarHeaderStyle} align="baseline">
          <kit.Space size={8}>
            <HierarchyTriangleRight16GrayIcon
              fill={"red"}
              className={IconStyle}
              width={16}
              height={16}
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{ transform: `rotate(${isCollapsed ? 0 : 90}deg)` }}
            />
            <div className={TitleStyle}>{title || t("dovetail.configure_file")}</div>
          </kit.Space>
          <kit.Space size={14}>
            {isDiff ? undefined : (
              <>
                <kit.Tooltip title={t("dovetail.copy")}>
                  <ClipboardCopy16GradientGrayIcon
                    data-disabled={isCollapsed}
                    className={IconStyle}
                    width={16}
                    height={16}
                    onClick={() => copyToClipboard(value)}
                  />
                </kit.Tooltip>
                <Seperator />
                <kit.Tooltip title={t("dovetail.reset_arguments")}>
                  <Retry16GradientGrayIcon
                    data-disabled={isCollapsed}
                    className={IconStyle}
                    width={16}
                    height={16}
                    onClick={() => {
                      editorInstance.current?.setValue(defaultValue);
                    }}
                  />
                </kit.Tooltip>
                <Seperator />
              </>
            )}
            <kit.Tooltip title={isDiff ? t("dovetail.back_to_edit") : t("dovetail.view_changes")}>
              {isDiff ? (
                <EditPen16Icon
                  data-disabled={isCollapsed}
                  className={IconStyle}
                  width={16}
                  height={16}
                  onClick={() => setIsDiff(false)}
                />
              ) : (
                <Showdiff16Icon
                  data-disabled={isCollapsed}
                  className={IconStyle}
                  width={16}
                  height={16}
                  onClick={() => setIsDiff(true)}
                />
              )}
            </kit.Tooltip>
          </kit.Space>
        </kit.Space>
        {errorMsgs.length ? (
          <kit.Space className={ErrorWrapperStyle} size={8} align="start">
            <XmarkFailedSeriousWarningFill16RedIcon className={ErrorIconStyle} />
            <div>
              {errorMsgs.map((errorMsg, index) => (
                <div className={ErrorMsgStyle} key={errorMsg}>
                  {errorMsgs.length > 1 ? `${index + 1}. ` : ""}
                  {errorMsg}
                </div>
              ))}
            </div>
          </kit.Space>
        ) : undefined}
      </kit.Space>
      <div
        style={{
          display: isCollapsed ? "none" : "block",
          width: "100%",
          height: "500px",
          overflow: "auto",
        }}
      >
        {isDiff ? (
          <Suspense fallback={<pre className={PlainCodeStyle}>{value}</pre>}>
            <MonacoYamlDiffEditor
              origin={defaultValue}
              modified={value}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<pre className={PlainCodeStyle}>{value}</pre>}>
            <MonacoYamlEditor
              getInstance={getInstance}
              defaultValue={defaultValue}
              onChange={onChange}
              onValidate={onValidate}
              onEditorCreate={props.onEditorCreate}
              onBlur={props.onBlur}
              schema={schema}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
});

export default implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "yaml_editor",
    description: "YAML Editor",
    displayName: "YAML Editor",
    exampleProperties: {
      defaultValue: initCode,
      errorMsgs: [],
    },
    exampleSize: [1, 1],
  },
  spec: {
    properties: PropsSchema,
    state: StateSchema,
    methods: {
      setValue: Type.Object({
        value: Type.String(),
      }),
      clear: Type.Object({}),
    },
    slots: {},
    styleSlots: ["content"],
    events: ["onChange"],
  },
})(
  ({
    defaultValue,
    errorMsgs = [],
    schema,
    mergeState,
    subscribeMethods,
    callbackMap,
    customStyle,
    elementRef,
  }) => {
    const ref = useRef<Handle>(null);

    const onChange = useCallback(
      (newVal: string) => {
        ref.current?.setValue(newVal);
        mergeState({ value: newVal });
        callbackMap?.onChange?.();
      },
      [callbackMap, mergeState]
    );

    const onValidate = useCallback(
      (valid: boolean, schemaValid: boolean) => {
        mergeState({ isValid: valid, isSchemaValid: schemaValid });
      },
      [mergeState]
    );

    useEffect(() => {
      subscribeMethods({
        setValue: newVal => {
          ref.current?.setEditorValue(newVal.value);
        },
        clear: () => {
          onChange("");
        },
      });
    }, [mergeState, onChange, subscribeMethods]);

    // init value
    useEffect(() => {
      mergeState({ value: defaultValue, isValid: true, isSchemaValid: true });
      callbackMap?.onChange?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callbackMap, mergeState]);

    return <YamlEditorComponent
      ref={ref}
      eleRef={elementRef}
      className={ecss(customStyle?.content)}
      defaultValue={defaultValue}
      errorMsgs={errorMsgs}
      schema={schema}
      onChange={onChange}
      onValidate={onValidate}
    />
  }
);

function copyToClipboard(text: string) {
  const input = document.createElement("textarea");
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}
