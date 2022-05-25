import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import AutoFrom from "../../_internal/components/_AutoForm/_AutoForm";
import { generateFromSchema } from "../../_internal/utils/generate-from-schema";

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
    const [value, setValue] = useState(
      defaultValue || generateFromSchema(spec)
    );
    useEffect(() => {
      mergeState({
        value,
      });
    }, [value]);

    return (
      <div ref={elementRef} style={{ width: "100%" }}>
        <AutoFrom
          spec={spec}
          value={value}
          onChange={(newV) => {
            setValue(newV);
          }}
          level={0}
          path=""
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
