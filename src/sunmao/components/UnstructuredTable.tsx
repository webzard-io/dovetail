import { useContext, useEffect, useState } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../themes/theme-context";
import type { ListMeta, ObjectMeta } from "kubernetes-types/meta/v1";
import { KubeApi } from "../../_internal/k8s-api/kube-api";

const UnstructuredTableProps = Type.Object({
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
  columns: Type.Array(
    Type.Object({
      title: Type.String(),
      dataIndex: Type.String(),
      width: Type.Number(),
    })
  ),
});

const UnstructuredTableState = Type.Object({});

type UnstructuredList = {
  apiVersion: string;
  kind: string;
  meatadata: ListMeta;
  items: Unstructured[];
};

type Unstructured = {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
};

const emptyData = {
  apiVersion: "",
  kind: "",
  meatadata: {},
  items: [],
};

export const UnstructuredTable = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_table",
    displayName: "UnstructuredTable",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      kind: "Deployment",
      apiBase: "apis/apps/v1/deployments",
      columns: [
        { title: "Name", dataIndex: "metadata.name", width: 100 },
        { title: "Namespace", dataIndex: "metadata.namespace", width: 200 },
        { title: "Age", dataIndex: "metadata.creationTimestamp", width: 100 },
      ],
    },
    exampleSize: [8, 4],
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: UnstructuredTableProps,
    state: UnstructuredTableState,
    methods: {},
    slots: {
      root: {
        slotProps: Type.Object({}),
      },
    },
    styleSlots: [],
    events: [],
  },
})(
  ({
    slotsElements,
    mergeState,
    columns,
    elementRef,
    apiBase,
    kind,
    namespace,
    fieldSelector,
  }) => {
    const kit = useContext(KitContext);
    const [{ data, loading, error }, setResponse] = useState<{
      data: UnstructuredList;
      loading: boolean;
      error: null | Error;
    }>({
      data: emptyData,
      loading: false,
      error: null,
    });
    useEffect(() => {
      const api = new KubeApi<UnstructuredList>({
        objectConstructor: {
          kind,
          apiBase,
        },
      });
      setResponse((prev) => ({ ...prev, loading: true }));
      api
        .list({ query: fieldSelector ? { fieldSelector } : {} })
        .then((res) => {
          setResponse((prev) => ({ ...prev, error: null, data: res }));
        })
        .catch((err) => {
          setResponse((prev) => ({ ...prev, error: err, data: emptyData }));
        })
        .finally(() => setResponse((prev) => ({ ...prev, loading: false })));
    }, [apiBase, kind, namespace]);

    return (
      <kit.Table
        ref={elementRef}
        columns={columns.map((col) => ({
          ...col,
          dataIndex: col.dataIndex.split("."),
        }))}
        data={data.items}
        loading={loading}
        rowKey={(row) => row.metadata.name}
      />
    );
  }
);
