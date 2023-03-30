import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { StringUnion, PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import {
  UnstructuredList,
  KubeSdk,
} from "../../_internal/k8s-api-client/kube-api";
import {
  DISPLAY_WIDGETS_MAP,
  DISPLAY_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/display";
import BaseKubectlGetTable, {
  emptyData,
} from "../../_internal/organisms/KubectlGetTable";
import { renderWidget } from "../utils/widget";
import { generateSlotChildren } from "../utils/slot";
import { css, cx } from "@emotion/css";
import { get } from "lodash";
import { KitContext } from "../../_internal/atoms/kit-context";

type Response = {
  data: UnstructuredList;
  loading: boolean;
  error: null | Error;
};

const WrapperStyle = css`
  &.table-wrapper.sunmao-cloudtower-table {
    border-top: 0;
  }

  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row.active-row
    td:first-child {
    border: 2px solid rgb(206, 230, 255);
    border-right: 0px;
  }

  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row.active-row
    td:last-child {
    border: 2px solid rgb(206, 230, 255);
    border-left: 0px;
  }

  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row.active-row
    td,
  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row:hover
    + tr.active-row
    td {
    border: 2px solid rgb(206, 230, 255);
    border-right: 0px;
    border-left: 0px;
  }

  .dovetail-ant-table-cell-fix-right,
  .dovetail-ant-table-cell-fix-right.cell__action_ {
    right: -2px !important;
  }

  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row.active-row
    td,
  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row.active-row
    td.dovetail-ant-table-cell-fix-right,
  .dovetail-ant-table
    .dovetail-ant-table-tbody
    .dovetail-ant-table-row.active-row:hover
    td.dovetail-ant-table-cell-fix-right {
    background: rgb(229, 242, 255);

    &:hover {
      background: rgb(229, 242, 255);
    }

    .dovetail-ant-table-cell-content {
      background: transparent;
    }
  }
`;

const WIDGET_CATEGORY = "Widget";
const SORT_CATEGORY = "Sort";
const FILTER_CATEGORY = "Filter";

const ColumnSpec = Type.Object(
  {
    dataIndex: Type.String({
      title: "Data index",
      description: "The key of the column data.",
      widget: "kui/v1/PathWidget",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    key: Type.String({
      title: "Key",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    title: Type.String({
      title: "Title",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    titleTooltip: Type.String({
      title: "Title tooltip",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    isActionColumn: Type.Boolean({
      title: "Is action column",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    canCustomizable: Type.Boolean({
      title: "Can customizable",
      category: PRESET_PROPERTY_CATEGORY.Basic,
      default: true,
    }),
    isDefaultDisplay: Type.Boolean({
      title: "Is default display",
      category: PRESET_PROPERTY_CATEGORY.Basic,
      default: true,
    }),
    widget: StringUnion(
      ["default", "component"].concat(Object.keys(DISPLAY_WIDGETS_MAP)),
      {
        title: "Widget",
        category: WIDGET_CATEGORY,
      }
    ),
    widgetOptions: Type.Record(Type.String(), Type.Any(), {
      title: "Widget options",
      widget: "kui/v1/OptionsWidget",
      widgetOptions: {
        optionsMap: DISPLAY_WIDGET_OPTIONS_MAP,
      },
      category: WIDGET_CATEGORY,
    }),
    componentId: Type.String({
      title: "Component ID",
      isComponentId: true,
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
      category: WIDGET_CATEGORY,
    }),
    fixed: StringUnion(["none", "left", "right"], {
      title: "Fixed",
      description: "Is the column fixed?",
      category: PRESET_PROPERTY_CATEGORY.Style,
    }),
    width: Type.Number({
      title: "Width",
      category: PRESET_PROPERTY_CATEGORY.Style,
    }),
    ellipsis: Type.Boolean({
      title: "Ellipsis",
      category: PRESET_PROPERTY_CATEGORY.Style,
    }),
    align: StringUnion(["left", "center", "right"], {
      title: "Align",
      category: PRESET_PROPERTY_CATEGORY.Style,
    }),
    sortType: StringUnion(["none", "auto", "server"], {
      title: "Sort type",
      category: SORT_CATEGORY,
    }),
    sortBy: Type.String({
      title: "Sort by",
      description:
        "The field path for sorting. It it is empty, that would use `dataIndex` to sort.",
      category: SORT_CATEGORY,
    }),
    defaultSortOrder: StringUnion(["ascend", "descend"], {
      title: "Default sort order",
      category: SORT_CATEGORY,
    }),
    filters: Type.Array(
      Type.Optional(
        Type.Object({
          text: Type.String(),
          value: Type.String(),
          compare: StringUnion(["equal", "includes"]),
        })
      ),
      {
        title: "Filter items",
        description: "The filter items.",
        category: FILTER_CATEGORY,
      }
    ),
    filterMultiple: Type.Boolean({
      title: "Filter multiple",
      description: "Can select multiple filters?",
      category: FILTER_CATEGORY,
    }),
  },
  {
    widget: "kui/v1/KubectlGetTableColumnWidget",
  }
);

const KubectlGetTableProps = Type.Object({
  basePath: Type.String({
    title: "Base path",
    description: "K8s Api base path",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  watchWsBasePath: Type.String({
    title: "Watch websocket base path",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  apiBase: Type.String({
    title: "Api base",
    widget: "kui/v1/ApiBaseWidget",
    description: "K8s resource api base, e.g, /apis/apps/v1",
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
  query: Type.Record(Type.String(), Type.Any(), {
    title: "Query",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  customData: Type.Any({
    title: "Custom Data",
    description: "The function to set custom data. ({ record, index })=> Record<string, any>",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  columns: Type.Array(ColumnSpec, {
    widget: "core/v1/array",
    widgetOptions: {
      displayedKeys: ["title"],
    },
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  customizable: Type.Boolean({
    title: "Customizable",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  customizableKey: Type.String({
    title: "Customizable key",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  defaultSize: Type.Number({
    title: "Default size",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  empty: Type.String({
    title: "Empty",
    description: "The text display when the data is empty.",
    category: PRESET_PROPERTY_CATEGORY.Basic,
  }),
  canActive: Type.Boolean({
    category: PRESET_PROPERTY_CATEGORY.Behavior,
    title: "Can active",
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
  loading: Type.Boolean(),
  error: Type.Any(),
  activeItem: Type.Any(),
  selectedItems: Type.Array(Type.Any()),
  columnSortOrder: Type.Record(Type.String(), Type.String()),
  currentPage: Type.Number(),
  currentSize: Type.Number(),
  deleting: Type.Boolean(),
});

export const KubectlGetTable = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_get_table",
    displayName: "Kubectl Get Table",
    exampleProperties: {
      basePath: "proxy-k8s",
      apiBase: "apis/kubesmart.smtx.io/v1alpha1",
      resource: "kubesmartclusters",
      columns: [
        {
          key: "name",
          title: "Name",
          dataIndex: "metadata.name",
          width: 100,
          sortType: "auto",
          filters: [],
        },
        {
          key: "namespace",
          title: "Namespace",
          dataIndex: "metadata.namespace",
          sortType: "none",
          width: 200,
          filters: [],
        },
        {
          key: "age",
          title: "Age",
          dataIndex: "metadata.creationTimestamp",
          sortType: "auto",
          width: 100,
          filters: [],
        },
      ],
      canActive: true,
      defaultSize: 10,
      empty: "No Data.",
    },
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
      setActive: Type.Object({
        activeKey: Type.String(),
      }),
      delete: Type.Object({
        items: Type.Array(Type.Any()),
        options: Type.Object({
          sync: Type.Boolean(),
        }),
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
    events: [
      "onActive",
      "onSelect",
      "onSort",
      "onPageChange",
      "onPageSizeChange",
      "onDeleteSuccess",
      "onDeleteFail",
    ],
  },
})(
  ({
    basePath,
    watchWsBasePath,
    apiBase,
    namespace,
    resource,
    query,
    columns,
    customizable,
    customizableKey,
    defaultSize,
    empty,
    customData,
    canActive,
    resizable,
    enableRowSelection,
    scroll,
    tableLayout,
    bordered,
    elementRef,
    callbackMap,
    slotsElements,
    customStyle,
    app,
    allComponents,
    services,
    component,
    mergeState,
    subscribeMethods,
  }) => {
    const kit = useContext(KitContext);
    const [response, setResponse] = useState<Response>({
      data: emptyData,
      loading: false,
      error: null,
    });
    const [activeKey, setActiveKey] = useState<string>("");
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [columnSortOrder, setColumnSortOrder] = useState<
      Record<string, "ascend" | "descend">
    >(
      columns.reduce((result: Record<string, "ascend" | "descend">, col) => {
        if (col.defaultSortOrder) {
          result[col.key] = col.defaultSortOrder;
        }

        return result;
      }, {})
    );

    const kubeSdk = useMemo(() => new KubeSdk({ basePath }), [basePath]);

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
          [key]: order,
        };

        setColumnSortOrder(newColumnSortOrder);
        mergeState({
          columnSortOrder: newColumnSortOrder,
        });
        callbackMap?.onSort?.();
      },
      [mergeState, callbackMap]
    );
    const onActive = useCallback(
      (key: string) => {
        if (canActive) {
          setActiveKey(key);
          callbackMap?.onActive();
        }
      },
      [setActiveKey, callbackMap]
    );
    const onPageChange = useCallback(
      (currentPage) => {
        callbackMap?.onPageChange?.();
        mergeState({
          currentPage,
        });
      },
      [callbackMap, mergeState]
    );
    const onPageSizeChange = useCallback(
      (currentSize) => {
        callbackMap?.onPageSizeChange?.();
        mergeState({
          currentSize,
        });
      },
      [callbackMap, mergeState]
    );
    const onResponse = useCallback(
      (response: Response) => {
        const items: UnstructuredList["items"] =
          customData && typeof customData === "function"
            ? response.data.items.map((record, index) => ({
                ...record,
                customData: customData({ record, index }),
              }))
            : response.data.items;

        setResponse({
          ...response,
          data: {
            ...response.data,
            items,
          },
        });
      },
      [customData]
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
        setActive({ activeKey }) {
          setActiveKey(activeKey);
        },
        async delete({ items }) {
          try {
            mergeState({ deleting: true });
            await kubeSdk.deleteYaml(
              items.map((item) => ({
                ...item,
                kind: response.data.kind.replace(/List$/g, ""),
                apiVersion: response.data.apiVersion,
              }))
            );
            callbackMap?.onDeleteSuccess?.();
          } catch {
            callbackMap?.onDeleteFail?.();
          } finally {
            mergeState({ deleting: false });
          }
        },
      });
    }, [
      subscribeMethods,
      mergeState,
      callbackMap,
      response,
      selectedKeys,
      setSelectedKeys,
      kubeSdk,
    ]);
    useEffect(() => {
      mergeState({
        items: response.data.items,
        loading: response.loading,
        error: response.error,
      });
    }, [response, mergeState]);
    useEffect(() => {
      mergeState({
        activeItem: response.data.items.find(
          (item) =>
            `${item.metadata.namespace}/${item.metadata.name}` === activeKey
        ),
      });
    }, [activeKey, response, mergeState]);
    useEffect(() => {
      mergeState({
        selectedItems: response.data.items.filter((item) =>
          selectedKeys.includes(
            `${item.metadata.namespace}/${item.metadata.name}`
          )
        ),
      });
    }, [selectedKeys, response, mergeState]);
    useEffect(() => {
      mergeState({
        currentPage: 1,
        currentSize: defaultSize ?? 10,
      });
    }, []);

    return (
      <div
        ref={elementRef}
        className={cx(
          WrapperStyle,
          css(customStyle?.content),
          kit.TABLE_WRAPPER_SELECTOR.replace(".", ""),
          `${component.id}-table-wrapper`
        )}
      >
        <BaseKubectlGetTable
          tableKey={component.id}
          response={response}
          basePath={basePath}
          watchWsBasePath={watchWsBasePath}
          resource={resource}
          namespace={namespace}
          apiBase={apiBase}
          query={query}
          columns={columns.map((col, colIndex) => ({
            ...col,
            fixed: col.fixed === "none" ? undefined : col.fixed,
            dataIndex:
              typeof col.dataIndex === "string"
                ? col.dataIndex.split(".")
                : col.dataIndex,
            render: (value: any, record: any, index: number) => {
              return renderWidget(
                { ...col, path: col.dataIndex },
                {
                  value: value,
                  renderedValue: value ?? "-",
                  record,
                  index,
                },
                (slotProps: any, fallback: any, slotKey?: string) =>
                  generateSlotChildren(
                    {
                      app,
                      services,
                      component,
                      allComponents,
                      slotsElements,
                      slot: "cell",
                      slotKey: slotKey || "",
                      fallback,
                    },
                    {
                      generateId: (child) => {
                        return `${child.id}_${index}`;
                      },
                      generateProps() {
                        return slotProps;
                      },
                    }
                  ),
                `column_${colIndex}_${index}`
              );
            },
            sortOrder: columnSortOrder[col.key],
            sortDirections:
              col.sortType === "none" ? null : ["", "ascend", "descend"],
            sorter:
              col.sortType === "none"
                ? undefined
                : col.sortType === "server"
                ? true
                : (
                    a: UnstructuredList["items"][0],
                    b: UnstructuredList["items"][0]
                  ) => {
                    const valueA = get(a, col.sortBy || col.dataIndex);
                    const valueB = get(b, col.sortBy || col.dataIndex);

                    if (
                      typeof valueA === "number" &&
                      typeof valueB === "number"
                    ) {
                      return valueA - valueB;
                    }

                    return String(valueA).localeCompare(String(valueB));
                  },
            filters: col.filters?.length ? col.filters : undefined,
            onFilter(value: string, record: UnstructuredList["items"][0]) {
              const compare = col.filters.find(
                (filter) => filter.value === value
              )?.compare;
              const cellValue = get(record, col.dataIndex);

              switch (compare) {
                case "equal": {
                  return cellValue === value;
                }
                case "includes": {
                  return cellValue.includes(value);
                }
              }

              return true;
            },
          }))}
          customizable={customizable}
          customizableKey={customizableKey}
          activeKey={activeKey}
          scroll={scroll}
          tableLayout={tableLayout}
          defaultSize={defaultSize}
          empty={empty}
          bordered={bordered}
          resizable={resizable}
          selectedKeys={selectedKeys}
          wrapper={elementRef!}
          onResponse={onResponse}
          onSelect={enableRowSelection ? onSelectChange : undefined}
          onActive={onActive}
          onSorterChange={onSorterChange}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    );
  }
);
