import React, { useEffect, useState } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import AutoFrom from "../../_internal/components/_AutoForm/_AutoForm";
import { mergeWith } from "lodash-es";
import { generateFromSchema } from "../../_internal/utils/generate-from-schema";

const UnstructuredFormProps = Type.Object({
  spec: Type.Any(),
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
    slots: {},
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
  }) => {
    const [value, setValue] = useState(generateFromSchema(spec));
    useEffect(() => {
      mergeState({
        value,
      });
    }, [value]);

    return (
      <div ref={elementRef}>
        <AutoFrom
          spec={spec}
          value={value}
          onChange={(newV) => {
            setValue(newV);
          }}
          level={0}
          path=""
        />
      </div>
    );
  }
);
