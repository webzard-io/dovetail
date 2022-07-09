import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { UnstructuredList } from "../../_internal/k8s-api-client/kube-api";
import ObjectAge from "../../_internal/molecules/ObjectAge";
import _UnstructuredTable, {
  emptyData,
} from "../../_internal/organisms/UnstructuredTable";

const UnstructuredTableProps = Type.Object({
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
  columns: Type.Array(
    Type.Object({
      key: Type.String(),
      title: Type.String(),
      dataIndex: Type.String(),
      width: Type.Number(),
    }),
    {
      widgetOptions: {
        displayedKeys: ["title"],
      },
    }
  ),
});

const UnstructuredTableState = Type.Object({
  items: Type.Array(Type.Any()),
  activeItem: Type.Any(),
  selectedItems: Type.Array(Type.Any()),
});

export const UnstructuredTable = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_table",
    displayName: "Unstructured Table",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      kind: "Deployment",
      apiBase: "apis/apps/v1/deployments",
      columns: [
        { key: "name", title: "Name", dataIndex: "metadata.name", width: 100 },
        {
          key: "namespace",
          title: "Namespace",
          dataIndex: "metadata.namespace",
          width: 200,
        },
        {
          key: "age",
          title: "Age",
          dataIndex: "metadata.creationTimestamp",
          width: 100,
        },
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
      cell: {
        slotProps: Type.Object({
          key: Type.String(),
          value: Type.Any(),
          record: Type.Any(),
          index: Type.Number(),
        }),
      },
    },
    styleSlots: [],
    events: ["onActive", "onSelect"],
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
    callbackMap,
    basePath,
  }) => {
    const [response, setResponse] = useState<{
      data: UnstructuredList;
      loading: boolean;
      error: null | Error;
    }>({
      data: emptyData,
      loading: false,
      error: null,
    });
    const [activeKey, setActiveKey] = useState<string>("");
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    useEffect(() => {
      mergeState({
        items: response.data.items,
      });
    }, [response]);
    useEffect(() => {
      mergeState({
        activeItem: response.data.items.find(
          (item) =>
            `${item.metadata.namespace}/${item.metadata.name}` === activeKey
        ),
      });
    }, [activeKey, response]);
    useEffect(() => {
      mergeState({
        selectedItems: response.data.items.filter((item) =>
          selectedKeys.includes(
            `${item.metadata.namespace}/${item.metadata.name}`
          )
        ),
      });
    }, [selectedKeys, response]);

    return (
      <_UnstructuredTable
        ref={elementRef}
        basePath={basePath}
        kind={kind}
        namespace={namespace}
        apiBase={apiBase}
        fieldSelector={fieldSelector}
        onResponse={setResponse}
        columns={columns.map((col) => ({
          ...col,
          dataIndex: col.dataIndex.split("."),
          render: (value: any, record: any, index: number) => {
            const slotEl = slotsElements.cell?.({
              value,
              record,
              index,
              key: col.key,
            });
            const len = renderToStaticMarkup(<>{slotEl}</>).length;
            if (len) {
              return slotEl;
            }
            if (col.dataIndex === "metadata.creationTimestamp") {
              return <ObjectAge date={value} />;
            }
            return value;
          },
        }))}
        activeKey={activeKey}
        onActive={(key: string) => {
          setActiveKey(key);
          callbackMap?.onActive();
        }}
        selectedKeys={selectedKeys}
        onSelect={(keys: string[]) => {
          setSelectedKeys(keys);
          callbackMap?.onSelect();
        }}
      />
    );
  }
);
