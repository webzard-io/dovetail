import React from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { css } from "@emotion/css";
import _UnstructuredCard from "../../_internal/organisms/UnstructuredCard";

const UnstructuredCardProps = Type.Object({
  kind: Type.String({
    description: "K8s resource kind, e.g, Deployment",
  }),
  namespace: Type.String({
    description: "namespace filter",
  }),
  apiBase: Type.String({
    description: "K8s resource api base, e.g, /apis/apps/v1/deployments",
  }),
  fieldSelector: Type.String(),
});

const UnstructuredCardState = Type.Object({
  item: Type.Any(),
  loading: Type.Boolean(),
  error: Type.Optional(Type.String()),
});

export const UnstructuredCard = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_card",
    displayName: "Unstructured Card",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 4],
    exampleProperties: {
      kind: "Deployment",
      apiBase: "apis/apps/v1/deployments",
      defaultVisible: true,
    },
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: UnstructuredCardProps,
    state: UnstructuredCardState,
    methods: {},
    slots: {},
    styleSlots: [],
    events: [],
  },
})(({ kind, apiBase, namespace, fieldSelector, elementRef, mergeState }) => {
  return (
    <_UnstructuredCard
      ref={elementRef}
      kind={kind}
      apiBase={apiBase}
      namespace={namespace}
      fieldSelector={fieldSelector}
      onResponse={(res) => {
        mergeState({
          item: res.data,
          loading: res.loading,
          error: res.error?.message || undefined,
        });
      }}
    />
  );
});
