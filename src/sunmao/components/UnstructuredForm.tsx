import React, { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import _UnstructuredForm from "../../_internal/organisms/UnstructuredForm";
import { css as dCss, cx } from "@emotion/css";

const UnstructuredFormProps = Type.Object({
  spec: Type.Any({
    widget: "kui/v1/AutoFormSpecWidget",
  }),
  defaultValue: Type.Any(),
  wizard: Type.Optional(
    Type.Object({
      steps: Type.Array(
        Type.Object({
          title: Type.String(),
          disabled: Type.Boolean(),
        }),
        {
          widgetOptions: {
            displayedKeys: ["title"],
          },
        }
      ),
      disablePrevStep: Type.Boolean(),
      defaultIndex: Type.Number({
        default: 0,
      }),
    })
  ),
  layout: Type.Object({
    steps: Type.Array(
      Type.Object({
        paths: Type.Array(Type.String()),
      })
    ),
  }),
});

const UnstructuredTableState = Type.Object({
  value: Type.Any(),
  step: Type.Number(),
});

const exampleSpec = {};

export const UnstructuredForm = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_form",
    displayName: "Unstructured Form",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 4],
    exampleProperties: {
      spec: exampleSpec,
    },
    annotations: {
      category: "Input",
    },
  },
  spec: {
    properties: UnstructuredFormProps,
    state: UnstructuredTableState,
    methods: {},
    slots: {
      beforeField: {
        slotProps: Type.Object({
          path: Type.String(),
          level: Type.Number(),
        }),
      },
      field: {
        slotProps: Type.Object({
          path: Type.String(),
          level: Type.Number(),
        }),
      },
      afterField: {
        slotProps: Type.Object({
          path: Type.String(),
          level: Type.Number(),
        }),
      },
    },
    styleSlots: ["form"],
    events: ["onPrevious", "onNext", "onCancel"],
  },
})(
  ({
    spec,
    defaultValue,
    elementRef,
    callbackMap,
    mergeState,
    subscribeMethods,
    slotsElements,
    customStyle,
    wizard,
    layout,
  }) => {
    useEffect(() => {
      mergeState({
        step: wizard?.defaultIndex ?? 0,
      });
    }, [mergeState, wizard]);

    return (
      <div
        ref={elementRef}
        className={cx(
          dCss`
            width: 100%;
          `
        )}
      >
        <_UnstructuredForm
          className={cx(
            dCss`
              ${customStyle?.form}
            `
          )}
          spec={spec}
          wizard={
            wizard && {
              ...wizard,
              onStepChange(newStep) {
                mergeState({
                  step: newStep,
                });
              },
              onPrevious: callbackMap?.onPrevious,
              onCancel: callbackMap?.onCancel,
              onNext: callbackMap?.onNext,
            }
          }
          layout={layout}
          defaultValue={defaultValue}
          onChange={(newV) => {
            mergeState({
              value: newV,
            });
          }}
          renderer={(path, level, position) => {
            if (position === "before") {
              return slotsElements.beforeField?.({
                path,
                level,
              }) as React.ReactNode;
            }
            if (position === "after") {
              return slotsElements.afterField?.({
                path,
                level,
              }) as React.ReactNode;
            }
            if (position === "widget") {
              const fieldEl = slotsElements.field?.({
                path,
                level,
              }) as React.ReactNode;
              const _ = window.document.createElement;
              window.document.createElement = null as any;
              const len = renderToStaticMarkup(<>{fieldEl}</>).length;
              window.document.createElement = _;
              if (len) {
                return fieldEl;
              }
            }
            return null;
          }}
        />
      </div>
    );
  }
);
