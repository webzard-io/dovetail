import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import { css as ecss } from "@emotion/css";
import BaseK8sLabelGroup from "../../_internal/components/K8sLabelGroup";
import { Label } from "../../_internal/components/LabelGroup";
import { omit } from "lodash";
import React, { useCallback, useState, useEffect } from "react";

export const K8sLabelGroup = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "k8s_label_group",
    displayName: "LabelGroup",
    description: "",
    isDraggable: false,
    isResizable: false,
    exampleProperties: {
      labels: {},
      editable: false,
    },
    exampleSize: [1, 1],
    annotations: {
      category: PRESET_PROPERTY_CATEGORY.Basic,
    },
  },
  spec: {
    properties: Type.Object({
      labels: Type.Record(Type.String(), Type.String(), {
        title: "Labels",
      }),
      editable: Type.Boolean({
        title: "Editable",
      }),
    }),
    state: Type.Object({
      labels: Type.Record(Type.String(), Type.String()),
      keyErrors: Type.Array(
        Type.Object({
          code: Type.String(),
        })
      ),
      valueErrors: Type.Array(
        Type.Object({
          code: Type.String(),
        })
      ),
    }),
    methods: {},
    slots: {},
    styleSlots: ["content"],
    events: ["onChange"],
  },
})(({ labels, editable, customStyle, elementRef, callbackMap, mergeState }) => {
  const [labelsState, setLabelsState] = useState(labels);

  useEffect(() => {
    setLabelsState(labels);
    mergeState({
      labels,
    });
  }, [labels, mergeState]);

  const onChange = useCallback(
    (newLabelsArray) => {
      const newLabels = newLabelsArray.reduce((result: Record<string, string>, label: Label) => {
        result[label.key] = label.value || "";

        return result;
      }, {});

      setLabelsState(newLabels);
      mergeState({
        labels: newLabels,
      });
      callbackMap?.onChange?.();
    },
    [callbackMap, mergeState]
  );
  const onEditedKeyChange = useCallback(
    (value, errors) => {
      mergeState({
        keyErrors: errors,
      });
    },
    [mergeState]
  );
  const onEditedValueChange = useCallback(
    (value, errors) => {
      mergeState({
        valueErrors: errors,
      });
    },
    [mergeState]
  );

  return (
    <BaseK8sLabelGroup
      ref={elementRef}
      className={ecss(customStyle?.content)}
      labels={Object.entries(labelsState || {}).map(([key, value]) => ({
        key,
        value,
      }))}
      editable={editable}
      onChange={onChange}
      onEditedKeyChange={onEditedKeyChange}
      onEditedValueChange={onEditedValueChange}
    />
  );
});
