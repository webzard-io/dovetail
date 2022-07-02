import React from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { css } from "@emotion/css";
import _UnstructuredPage from "../../_internal/organisms/UnstructuredPage";

const UnstructuredPageProps = Type.Object({
  basePath: Type.String({
    description: "K8s Api base path",
  }),
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

const UnstructuredPageState = Type.Object({
  item: Type.Any(),
  loading: Type.Boolean(),
  error: Type.Optional(Type.String()),
});

export const UnstructuredPage = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_page",
    displayName: "Unstructured Page",
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
    properties: UnstructuredPageProps,
    state: UnstructuredPageState,
    methods: {},
    slots: {},
    styleSlots: [],
    events: [],
  },
})(
  ({
    kind,
    apiBase,
    namespace,
    fieldSelector,
    elementRef,
    mergeState,
    basePath,
  }) => {
    return (
      <_UnstructuredPage
        ref={elementRef}
        basePath={basePath}
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
  }
);
