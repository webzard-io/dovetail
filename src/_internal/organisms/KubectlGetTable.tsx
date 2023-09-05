import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { kitContext, TableProps, } from "@cloudtower/eagle";
import { AuxiliaryLine } from "../atoms/themes/CloudTower/components/Table/TableWidgets";
import CustomizeColumn from "../atoms/themes/CloudTower/components/Table/CustomizeColumn";
import {
  useCustomizeColumn,
  type CustomizeColumnType,
} from "../atoms/themes/CloudTower/components/Table/customize-column";
import { KubeApi, UnstructuredList, Unstructured } from "../k8s-api-client/kube-api";
import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";
import { TableLoading } from "../atoms/themes/CloudTower/components/Table/TableWidgets";
import HeaderCell from "../atoms/themes/CloudTower/components/Table/HeaderCell";
import { useTransformScrollAndColumns } from "../atoms/themes/CloudTower/components/Table/common";
import { get, isMatch } from "lodash";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";
import ErrorContent from "../ErrorContent";
import { useTranslation } from "react-i18next";

const TableWrapper = styled.div`
  overflow: auto;
  min-height: 150px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const TableContent = styled.div`
  overflow: hidden;
  position: relative;

  .ant-pagination {
    display: none;
  }

  .ant-table-container {
    display: flex;
    flex-direction: column;
    
    .ant-table-body {
      flex: 1;
    }
  }
`;
const TooltipStyle = css`
  .ant-tooltip-inner {
    background: rgba(23, 38, 64, 0.8);
    box-shadow: 0px 1px 4px rgba(29, 50, 108, 0.6);
    border-radius: 4px;
    padding: 4px 10px;
    min-height: 18px;
  }

  .ant-tooltip-arrow {
    display: none;
  }
`;
const ColumnTitleStyle = css`
  border-bottom: 1px dashed #00122e;
`;

type Columns = (TableProps<Unstructured & { id: string }>["columns"][0] & {
  titleTooltip?: string;
  isActionColumn?: boolean;
  canCustomizable?: boolean;
  isDefaultDisplay?: boolean;
  className?: string;
})[];
type KubectlGetTableProps = {
  tableKey: string;
  basePath: string;
  watchWsBasePath?: string;
  resource: string;
  namespace: string;
  apiBase: string;
  query: Record<string, unknown>;
  defaultSize?: number;
  columns: Columns;
  response: {
    data: UnstructuredList;
    loading: boolean;
    error: null | Error;
  };
  wrapper: React.MutableRefObject<HTMLDivElement>;
  loading?: boolean;
  customizable: boolean;
  customizableKey: string;
  activeKey?: string;
  selectedKeys?: string[];
  onSelect?: (keys: string[], records: any[]) => void;
  onActive?: (key: string, record: any) => void;
  onFetchStart?: (res: any) => void;
  onResponse?: (res: any) => void;
  onWatchUpdate?: (res: any) => void;
  onError?: (res: any) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
} & Omit<TableProps<Unstructured & { id: string; }>, "dataSource" | "rowKey" | "columns">;

export const emptyData = {
  apiVersion: "",
  kind: "",
  metadata: {},
  items: [],
};

const KubectlGetTable = React.forwardRef<HTMLElement, KubectlGetTableProps>(
  function KubectlGetTable(
    {
      tableKey,
      basePath,
      watchWsBasePath,
      apiBase,
      namespace,
      resource,
      query,
      defaultSize,
      response,
      wrapper,
      activeKey,
      selectedKeys,
      onSelect,
      onActive,
      onFetchStart,
      onResponse,
      onWatchUpdate,
      onError,
      onPageChange,
      onPageSizeChange,
      ...tableProps
    },
  ) {
    const kit = useContext(kitContext);
    const { t } = useTranslation();
    const auxiliaryLine = useRef(null);
    const cellPropsMap = useRef(new Map());
    const stop = useRef<Function | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSize, setCurrentSize] = useState(defaultSize ?? 10);
    const { data, loading, error } = response;

    const rowKey = useCallback((row: UnstructuredList["items"][0]) => `${row.metadata.namespace}/${row.metadata.name}`, []);
    const getRealRowKey = useCallback((record: any) => {
      return typeof rowKey === "string" ? record[rowKey] : rowKey?.(record);
    }, [rowKey]);
    const rowClassName = useCallback((r) => {
      return getRealRowKey(r) === activeKey ? "active-row" : "";
    }, [activeKey, getRealRowKey]);
    const rowSelection = useMemo(()=> onSelect && ({
      type: "checkbox" as const,
      selectedRowKeys: selectedKeys,
      onChange(keys: unknown, rows: unknown[]) {
        onSelect(keys as string[], rows);
      },
    }), [onSelect, selectedKeys]);
    const onRowClick = useCallback((record: any, index) => {
      const key = getRealRowKey(record);
      onActive?.(key, record);
    }, [getRealRowKey, onActive]);

    const api = useMemo(
      () =>
        new KubeApi<UnstructuredList>({
          basePath,
          watchWsBasePath,
          objectConstructor: {
            resourceBasePath: apiBase,
            resource,
            namespace,
          },
        }),
      [basePath, watchWsBasePath, apiBase, resource, namespace]
    );
    const defaultCustomizeColumn: [string, () => CustomizeColumnType[]] =
      useMemo(() => {
        return [
          tableProps.customizableKey || "kgt",
          () => {
            return tableProps.columns.map((column) => ({
              key: column.key,
              width: column.width,
              display: column.isDefaultDisplay ?? true,
            }));
          },
        ];
      }, [tableProps.columns, tableProps.customizableKey]);
    const [customizeColumns] = useCustomizeColumn(...defaultCustomizeColumn);

    let columns: (Columns[0] & { index?: number })[] = [];

    customizeColumns.forEach((customizableColumn, index) => {
      if (!customizableColumn.display) return;

      const column = tableProps.columns.find(
        (column) => column.key === customizableColumn.key
      );

      if (column) {
        columns.push({
          ...column,
          index,
          width: customizableColumn.width,
          ellipsis: true,
        });
      }
    });

    const allColumnKeys = tableProps.columns.map(({ key }) => key);
    const disabledColumnKeys: string[] = [];
    const customizableColumnKeys: string[] = [];
    const columnTitleMap = tableProps.columns.reduce((result, column) => {
      result[column.key] = column.title as string;

      return result;
    }, {} as Record<string, string>);

    tableProps.columns.forEach((column, index) => {
      customizableColumnKeys.push(column.key);
      if (!column.canCustomizable) {
        disabledColumnKeys.push(column.key);
      }
    });

    const [, finalColumns] = useTransformScrollAndColumns<any>({
      wrapper,
      loading,
      rowSelection: false,
      data,
      tableKey,
      uniqueKey: `KGT-${tableKey}`,
      stickyHeader: false,
      columns,
      scroll: tableProps.scroll,
    });

    columns = useMemo(() => finalColumns.map((column) => ({
      ...column,
      onHeaderCell: () => ({
        index: column.index,
        sortable: column.canCustomizable,
        draggable: column.canCustomizable,
        tooltip: column.titleTooltip,
      }),
      onCell(record: any) {
        const value = column.dataIndex ? get(record, column.dataIndex) : "";
        const oldCellProps = cellPropsMap.current.get(column.key);
        const cellProps = {
          title: typeof value !== "object" ? value : "",
          unique: column.key,
        };

        if (isMatch(oldCellProps, cellProps)) {
          return oldCellProps;
        } else {
          cellPropsMap.current.set(column.key, cellProps);

          return cellProps;
        }
      },
      title:
        tableProps.customizable && column.isActionColumn ? (
          <CustomizeColumn
            defaultCustomizeColumn={defaultCustomizeColumn}
            allColumnKeys={allColumnKeys}
            disabledColumnKeys={disabledColumnKeys}
            columnTitleMap={columnTitleMap}
            data-test-id={"k8s-customizable-column"}
            customizableColumnKeys={customizableColumnKeys}
          />
        ) : (
          <kit.tooltip
            align={{ offset: [0, 6] }}
            overlayClassName={cx(TooltipStyle, Typo.Label.l4_regular)}
            title={column.titleTooltip}
            arrowContent={<span />}
          >
            <span className={column.titleTooltip ? ColumnTitleStyle : ""}>
              {column.title}
            </span>
          </kit.tooltip>
        ),
    })), [allColumnKeys, columnTitleMap, customizableColumnKeys, defaultCustomizeColumn, disabledColumnKeys, finalColumns, kit, tableProps.customizable]);

    const components = useMemo(
      () => ({
        header: {
          cell: (props: any) => (
            <HeaderCell
              {...props}
              resizable={true}
              components={undefined}
              auxiliaryLine={auxiliaryLine}
              wrapper={wrapper}
              defaultCustomizeColumn={defaultCustomizeColumn}
            />
          ),
        },
        body: {
          cell: (props: any) => (
            <td
              {...props}
              className={`${props.className} cell_${props.unique}`}
            />
          ),
        },
      }),
      [auxiliaryLine, defaultCustomizeColumn, wrapper]
    );
    const pagination = useMemo(() => ({
      current: currentPage,
      pageSize: currentSize,
    }), [currentPage, currentSize]);

    const onTablePageChange = useCallback(
      (page) => {
        onPageChange?.(page);
        setCurrentPage(page);
      },
      [onPageChange]
    );
    const onTableSizeChange = useCallback(
      (size) => {
        onPageSizeChange?.(size);
        setCurrentSize(size);
      },
      [onPageSizeChange]
    );
    const fetch = useCallback(() => {
      if (stop.current) {
        stop.current();
        stop.current = null;
      }

      const createResponseCallback = (callback?: (data: unknown)=> void) => {
        return (res: UnstructuredList)=> {
          callback?.({
            loading: false,
            error: null,
            data: {
              ...res,
              items: res.items.sort(
                (a, b) =>
                  new Date(b.metadata.creationTimestamp as string).getTime() -
                  new Date(a.metadata.creationTimestamp as string).getTime()
              ),
            },
          });
        }
      }

      onFetchStart?.({ ...response, loading: true });

      const stopP = api
        .listWatch({
          query: query || {},
          onResponse: createResponseCallback(onResponse),
          onWatchUpdate: createResponseCallback(onWatchUpdate),
        })
        .catch((err) => {
          onError?.({ loading: false, error: err, data: emptyData });
        });

      stop.current = () => {
        stopP.then((stop) => stop?.());
        stop.current = null;
      };

      return stop.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, namespace, query, onError, onResponse, onFetchStart, onWatchUpdate]);

    useEffect(() => {
      const stop = fetch();

      return () => {
        stop();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, namespace, query]);

    if (response.loading && response.data.items.length === 0 || tableProps.loading) {
      return <TableLoading></TableLoading>;
    } else if (error) {
      return (
        <ErrorContent
          errorText={t("dovetail.retry_when_access_data_failed")}
          refetch={fetch}
          style={{ padding: "15px 0" }}
        ></ErrorContent>
      );
    } else if (response.data.items.length === 0) {
      return (
        <ErrorContent
          errorText={t("dovetail.empty")}
          style={{ padding: "15px 0" }}
        ></ErrorContent>
      );
    }

    return (
      <TableWrapper className="dovetail-kubectl-get-table-wrapper">
        <TableContent>
          <kit.table
            {...tableProps}
            tableLayout="fixed"
            rowClassName={rowClassName}
            components={components}
            columns={columns}
            rowSelection={rowSelection}
            dataSource={data.items as Array<Unstructured & { id: string }>}
            pagination={pagination}
            error={error}
            loading={loading}
            rowKey={rowKey}
            wrapper={wrapper}
            onRowClick={onRowClick}
          />
          <AuxiliaryLine ref={auxiliaryLine}></AuxiliaryLine>
        </TableContent>
        <kit.pagination
          current={currentPage}
          size={currentSize}
          count={data.items.length}
          onChange={onTablePageChange}
          onSizeChange={onTableSizeChange}
        />
      </TableWrapper>
    );
  }
);

export default KubectlGetTable;
