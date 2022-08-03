import React, { useEffect, useState, useMemo, useCallback } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { StringUnion, PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import { UnstructuredList } from "../../_internal/k8s-api-client/kube-api";
import ObjectAge from "../../_internal/molecules/ObjectAge";
import {
  DISPLAY_WIDGETS_MAP,
  DISPLAY_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/display";
import BaseKubectlGetTable, {
  emptyData,
} from "../../_internal/organisms/KubectlGetTable";
import { renderWidget } from "../utils/widget";
import { css } from "@emotion/css";

const ColumnSpec = Type.Object({
  dataIndex: Type.String({
    title: "Data index",
    description: "The key of the column data.",
    widget: "kui/v1/PathWidget",
    widgetOptions: {
      withIndex: false,
    },
  }),
  key: Type.String({
    title: "Key",
  }),
  title: Type.String({ title: "Title" }),
  widget: StringUnion(
    ["none", "component"].concat(Object.keys(DISPLAY_WIDGETS_MAP)),
    {
      title: "Widget",
    }
  ),
  widgetOptions: Type.Record(Type.String(), Type.Any(), {
    title: "Widget options",
    widget: "kui/v1/OptionsWidget",
    widgetOptions: {
      optionsMap: DISPLAY_WIDGET_OPTIONS_MAP,
    },
  }),
  componentId: Type.String({
    title: "Component ID",
    widget: "kui/v1/CustomComponentWidget",
    widgetOptions: {
      isDisplayLabel: false,
      keyOfPath: "dataIndex",
      slot: "cell",
    },
    conditions: [
      {
        key: "widget",
        value: "component",
      },
    ],
  }),
  transform: Type.Any({
    title: "Transform",
  }),
  fixed: StringUnion(["none", "left", "right"], {
    title: "Fixed",
    description: "Is the column fixed?",
  }),
  width: Type.Number({ title: "Width" }),
  ellipsis: Type.Boolean({ title: "Ellipsis" }),
  align: StringUnion(["left", "center", "right"], { title: "Align" }),
  sorter: Type.Any({
    title: "Sorter",
    description: "The sorter function. Set it as `true` to use server sorting.",
  }),
  defaultSortOrder: StringUnion(["ascend", "descend"], {
    title: "Default sort order",
  }),
  sortDirections: Type.Array(StringUnion(["ascend", "descend"]), {
    title: "Sort directions",
    description: "The sort directions.",
    widget: "core/v1/expression",
  }),
  filters: Type.Array(
    Type.Optional(
      Type.Object({
        text: Type.String(),
        value: Type.String(),
      })
    ),
    { title: "Filter items", description: "The filter items." }
  ),
  onFilter: Type.Any({
    title: "Filter",
    description: "The filter function: `(value, record)=> boolean`.",
  }),
  filterMultiple: Type.Boolean({
    title: "Filter multiple",
    description: "Can select multiple filters?",
  }),
});

const KubectlGetTableProps = Type.Object({
  basePath: Type.String({
    title: "Base path",
    description: "K8s Api base path",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  apiBase: Type.String({
    title: "Api base",
    widget: "kui/v1/ApiBaseWidget",
    description: "K8s resource api base, e.g, /apis/apps/v1/deployments",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  namespace: Type.String({
    title: "Namespace",
    description: "namespace filter",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  resource: Type.String({
    title: "Resource",
    category: PRESET_PROPERTY_CATEGORY.Data,
    widget: "kui/v1/ResourceWidget",
    conditions: [
      {
        key: "apiBase",
        not: "",
      },
      {
        key: "apiBase",
        not: undefined,
      },
    ],
  }),
  fieldSelector: Type.String({
    title: "Field selector",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  columns: Type.Array(ColumnSpec, {
    widget: "core/v1/array",
    widgetOptions: {
      displayedKeys: ["title"],
    },
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  empty: Type.String({
    title: "Empty",
    description: "The text display when the data is empty.",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  resizable: Type.Boolean({
    category: PRESET_PROPERTY_CATEGORY.Behavior,
    title: "Resizable",
  }),
  enableRowSelection: Type.Boolean({
    category: PRESET_PROPERTY_CATEGORY.Behavior,
    title: "Enable row selection",
  }),
  scroll: Type.Object(
    {
      x: Type.String({ title: "X" }),
      y: Type.String({ title: "Y" }),
    },
    {
      category: PRESET_PROPERTY_CATEGORY.Layout,
      title: "Scroll",
    }
  ),
  tableLayout: StringUnion(["auto", "fixed"], {
    category: PRESET_PROPERTY_CATEGORY.Layout,
    title: "Table layout",
  }),
  bordered: Type.Boolean({
    title: "Bordered",
    category: PRESET_PROPERTY_CATEGORY.Style,
  }),
});

const KubectlGetTableState = Type.Object({
  items: Type.Array(Type.Any()),
  activeItem: Type.Any(),
  selectedItems: Type.Array(Type.Any()),
  columnSortOrder: Type.Record(Type.String(), Type.String()),
});

export const KubectlGetTable = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_get_table",
    displayName: "Kubectl Get Table",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      basePath: "proxy-k8s",
      apiBase: "/apis/kubesmart.smtx.io/v1alpha1",
      resource: "kubesmartclusters",
      columns: [
        {
          key: "name",
          title: "Name",
          dataIndex: "metadata.name",
          width: 100,
          filters: [],
        },
        {
          key: "namespace",
          title: "Namespace",
          dataIndex: "metadata.namespace",
          width: 200,
          filters: [],
        },
        {
          key: "age",
          title: "Age",
          dataIndex: "metadata.creationTimestamp",
          width: 100,
          filters: [],
        },
      ],
      empty: "No Data.",
    },
    exampleSize: [8, 4],
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: KubectlGetTableProps,
    state: KubectlGetTableState,
    methods: {
      setSelectedRows: Type.Object({
        keys: Type.Array(Type.String()),
      }),
    },
    slots: {
      cell: {
        slotProps: Type.Object({
          key: Type.String(),
          dataIndex: Type.String(),
          value: Type.Any(),
          record: Type.Any(),
          index: Type.Number(),
        }),
      },
    },
    styleSlots: ["content"],
    events: ["onActive", "onSelect", "onSort"],
  },
})(
  ({
    basePath,
    apiBase,
    namespace,
    resource,
    fieldSelector,
    columns,
    empty,
    resizable,
    enableRowSelection,
    scroll,
    tableLayout,
    bordered,
    elementRef,
    callbackMap,
    slotsElements,
    customStyle,
    mergeState,
    subscribeMethods,
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
    const [columnSortOrder, setColumnSortOrder] = useState<
      Record<string, "ascend" | "descend">
    >({});

    const onSelectChange = useCallback(
      (newSelectedRowKeys, newSelectedRows) => {
        setSelectedKeys(newSelectedRowKeys);
        mergeState({
          selectedItems: newSelectedRows,
        });
        callbackMap?.onSelect?.();
      },
      [callbackMap, mergeState, setSelectedKeys]
    );
    const onSorterChange = useCallback(
      (order, key) => {
        const newColumnSortOrder = {
          ...columnSortOrder,
          [key]: order,
        };

        setColumnSortOrder(newColumnSortOrder);
        mergeState({
          columnSortOrder: newColumnSortOrder,
        });
        callbackMap?.onSort?.();
      },
      [mergeState, columnSortOrder, callbackMap]
    );
    const onActive = useCallback(
      (key: string) => {
        setActiveKey(key);
        callbackMap?.onActive();
      },
      [setActiveKey, callbackMap]
    );

    useEffect(() => {
      subscribeMethods({
        setSelectedRows({ keys }) {
          const rows = response.data.items.filter((row) =>
            keys.includes(`${row.metadata.namespace}/${row.metadata.name}`)
          );

          setSelectedKeys(keys);
          mergeState({
            selectedItems: rows,
          });
        },
      });
    }, [subscribeMethods, mergeState, response, selectedKeys, setSelectedKeys]);
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
      <div ref={elementRef} className={css(customStyle?.content)}>
        <BaseKubectlGetTable
          basePath={basePath}
          resource={resource}
          namespace={namespace}
          apiBase={apiBase}
          fieldSelector={fieldSelector}
          onResponse={setResponse}
          columns={columns.map((col) => ({
            ...col,
            fixed: col.fixed === "none" ? undefined : col.fixed,
            dataIndex: col.dataIndex.split("."),
            render: (value: any, record: any, index: number) => {
              return renderWidget(
                { ...col, path: col.dataIndex },
                {
                  value,
                  record,
                  index,
                },
                slotsElements.cell
              );
            },
            sortOrder: columnSortOrder[col.key],
            filters: col.filters?.length ? col.filters : undefined,
          }))}
          activeKey={activeKey}
          scroll={scroll}
          tableLayout={tableLayout}
          empty={empty}
          bordered={bordered}
          resizable={resizable}
          selectedKeys={selectedKeys}
          onSelect={enableRowSelection ? onSelectChange : undefined}
          onActive={onActive}
          onSorterChange={onSorterChange}
        />
      </div>
    );
  }
);
