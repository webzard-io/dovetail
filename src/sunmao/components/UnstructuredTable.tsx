import React, { useContext, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../themes/theme-context";
import { KubeApi, UnstructuredList } from "../../_internal/k8s-api/kube-api";
import _ObjectAge from "../../_internal/components/_ObjectAge";

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
          namespace,
        },
      });
      const doRequest = (s: boolean) => {
        setResponse((prev) => ({ ...prev, loading: s ? false : true }));
        api
          .list({ query: fieldSelector ? { fieldSelector } : {} })
          .then((res) => {
            setResponse((prev) => ({ ...prev, error: null, data: res }));
          })
          .catch((err) => {
            setResponse((prev) => ({ ...prev, error: err, data: emptyData }));
          })
          .finally(() => setResponse((prev) => ({ ...prev, loading: false })));
      };
      doRequest(false);
      setInterval(() => {
        doRequest(true);
      }, 5000);
    }, [apiBase, kind, namespace]);
    const [activeKey, setActiveKey] = useState<string>("");
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    useEffect(() => {
      mergeState({
        items: data.items,
      });
    }, [data.items]);
    useEffect(() => {
      mergeState({
        activeItem: data.items.find((item) => item.metadata.name === activeKey),
      });
    }, [activeKey, data.items]);
    useEffect(() => {
      mergeState({
        selectedItems: data.items.filter((item) =>
          selectedKeys.includes(item.metadata.name!)
        ),
      });
    }, [selectedKeys, data.items]);

    return (
      <kit.Table
        ref={elementRef}
        columns={columns.map((col) => ({
          ...col,
          dataIndex: col.dataIndex.split("."),
          render: (value, record, index) => {
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
              return <_ObjectAge date={value} />;
            }
            return value;
          },
        }))}
        data={data.items}
        loading={loading}
        rowKey={(row) => row.metadata.name}
        activeKey={activeKey}
        onActive={(key) => {
          setActiveKey(key);
          callbackMap?.onActive();
        }}
        selectedKeys={selectedKeys}
        onSelect={(keys) => {
          setSelectedKeys(keys);
          callbackMap?.onSelect();
        }}
      />
    );
  }
);
