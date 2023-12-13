import { KitContext } from "../../../_internal/atoms/kit-context";
import { Icon } from "@cloudtower/eagle";
import {
  ClipboardCopy16GradientGrayIcon,
  ClipboardCopy16GradientBlueIcon,
  HierarchyTriangleRight16GrayIcon,
  HierarchyTriangleRight16BlueIcon,
  Retry16GradientGrayIcon,
  Retry16GradientBlueIcon,
  XmarkFailedSeriousWarningFill16RedIcon,
  EditPen16GradientGrayIcon,
  EditPen16GradientBlueIcon,
  Showdiff16GradientGrayIcon,
  Showdiff16GradientBlueIcon
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
  height: Type.String(),
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
  id?: string;
  className?: string;
  height?: string;
  isDefaultCollapsed?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onValidate?: (valid: boolean, schemaValid: boolean) => void;
  onEditorCreate?: (editor: monaco.editor.ICodeEditor) => void;
  onBlur?: () => void;
}

export type Handle = {
  setValue: (value: string) => void;
  setEditorValue: (value: string) => void;
  getEditorValue: () => string;
}

export const YamlEditorComponent = forwardRef<Handle, Props>(function YamlEditorComponent(props, ref) {
  const { title, isDefaultCollapsed, defaultValue = "", height, readOnly, errorMsgs = [], schema, eleRef, className } = props;
  const kit = useContext(KitContext);
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(isDefaultCollapsed);
  const [isDiff, setIsDiff] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [copyTooltip, setCopyTooltip] = useState(t("dovetail.copy"));
  const [resetTooltip, setResetTooltip] = useState(t("dovetail.reset_arguments"));

  useImperativeHandle(ref, () => {
    return {
      setValue,
      setEditorValue: (value: string) => {
        editorInstance.current?.getModel()?.setValue(value);
      },
      getEditorValue: () => {
        return editorInstance.current?.getValue() ?? value ?? "";
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

  const onEditorCreate = useCallback((editor: monaco.editor.ICodeEditor) => {
    if (editor.getValue() !== value) {
      editorInstance.current?.getModel()?.setValue(value);
    }

    props.onEditorCreate?.(editor);
  }, [value, props.onEditorCreate]);

  const getInstance = useCallback((ins: monaco.editor.IStandaloneCodeEditor): void => {
    editorInstance.current = ins;
  }, []);

  return (
    <div
      className={cx(WrapperStyle, className)}
      data-is-error={!!errorMsgs.length}
      ref={eleRef}
    >
      <kit.Space className={cx(ToolBarStyle, isCollapsed ? "collapsed" : "")} direction="vertical" size={0}>
        <kit.Space className={ToolBarHeaderStyle} align="baseline">
          <kit.Space size={8}>
            <Icon
              src={HierarchyTriangleRight16GrayIcon}
              hoverSrc={HierarchyTriangleRight16BlueIcon}
              className={cx(IconStyle, isCollapsed ? "" : "arrow-down")}
              iconWidth={16}
              iconHeight={16}
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
            <div className={cx(TitleStyle, "yaml-editor-title")}>{title || t("dovetail.configure_file")}</div>
          </kit.Space>
          <kit.Space size={14}>
            {isDiff ? undefined : (
              <>
                <kit.Tooltip
                  title={isCollapsed ? "" : copyTooltip}
                  onVisibleChange={(visible) => {
                    if (!visible) {
                      setTimeout(() => {
                        setCopyTooltip(t("dovetail.copy"));
                      }, 80);
                    }
                  }}
                >
                  <Icon
                    data-disabled={isCollapsed}
                    src={ClipboardCopy16GradientGrayIcon}
                    hoverSrc={isCollapsed ? undefined : ClipboardCopy16GradientBlueIcon}
                    className={IconStyle}
                    iconWidth={16}
                    iconHeight={16}
                    onClick={() => {
                      if (!isCollapsed) {
                        copyToClipboard(value);
                        setCopyTooltip(t("dovetail.copied"));
                      }
                    }}
                  />
                </kit.Tooltip>
                <Seperator />
                <kit.Tooltip
                  title={isCollapsed ? "" : resetTooltip}
                  onVisibleChange={(visible) => {
                    if (!visible) {
                      setTimeout(() => {
                        setResetTooltip(t("dovetail.reset_arguments"));
                      }, 80);
                    }
                  }}
                >
                  <Icon
                    data-disabled={isCollapsed}
                    src={Retry16GradientGrayIcon}
                    hoverSrc={isCollapsed ? undefined : Retry16GradientBlueIcon}
                    className={IconStyle}
                    iconWidth={16}
                    iconHeight={16}
                    onClick={() => {
                      if (!isCollapsed) {
                        editorInstance.current?.setValue(defaultValue);
                        setResetTooltip(t("dovetail.already_reset"));
                      }
                    }}
                  />
                </kit.Tooltip>
                <Seperator />
              </>
            )}
            <kit.Tooltip title={isCollapsed ? "" : (isDiff ? t("dovetail.back_to_edit") : t("dovetail.view_changes"))}>
              {isDiff ? (
                <Icon
                  data-disabled={isCollapsed}
                  src={EditPen16GradientGrayIcon}
                  hoverSrc={isCollapsed ? undefined : EditPen16GradientBlueIcon}
                  className={IconStyle}
                  iconWidth={16}
                  iconHeight={16}
                  onClick={() => isCollapsed ? undefined : setIsDiff(false)}
                />
              ) : (
                <Icon
                  data-disabled={isCollapsed}
                  src={Showdiff16GradientGrayIcon}
                  hoverSrc={isCollapsed ? undefined : Showdiff16GradientBlueIcon}
                  className={IconStyle}
                  iconWidth={16}
                  iconHeight={16}
                  onClick={() => isCollapsed ? undefined : setIsDiff(true)}
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
          height: height || "500px",
          zIndex: 1
        }}
      >
        {isDiff ? (
          <Suspense fallback={<pre className={PlainCodeStyle}>{value}</pre>}>
            <MonacoYamlDiffEditor
              id={props.id}
              origin={defaultValue}
              modified={value}
              height={height}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<pre className={PlainCodeStyle}>{value}</pre>}>
            <MonacoYamlEditor
              id={props.id}
              getInstance={getInstance}
              defaultValue={defaultValue}
              height={height}
              onChange={onChange}
              onValidate={onValidate}
              onEditorCreate={onEditorCreate}
              onBlur={props.onBlur}
              schema={schema}
              readOnly={readOnly}
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
      height: "500px",
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
    height,
    component,
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
      id={component.id}
      eleRef={elementRef}
      height={height}
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
