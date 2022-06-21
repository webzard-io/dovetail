import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import _UnstructuredForm from "../../_internal/organisms/UnstructuredForm";

const UnstructuredFormProps = Type.Object({
  spec: Type.Any({
    widget: "kui/v1/AutoFormSpecWidget",
  }),
  defaultValue: Type.Any(),
});

const UnstructuredTableState = Type.Object({
  value: Type.Any(),
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
    styleSlots: [],
    events: [],
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
  }) => {
    return (
      <div ref={elementRef} style={{ width: "100%" }}>
        <_UnstructuredForm
          spec={spec}
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
