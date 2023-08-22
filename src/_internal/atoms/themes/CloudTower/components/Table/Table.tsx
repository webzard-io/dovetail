import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Table as BaseTable } from "antd";
import type {
  TableProps as AntdTableProps,
  ColumnsType,
  ColumnType,
} from "antd/lib/table";
import type { TableRowSelection } from "antd/lib/table/interface";
import { cx } from "@linaria/core";
import { ColumnTitle, TableLoading } from "./TableWidgets";
import { TableContainerStyle, TableStyle } from "./Table.style";
import Loading from "../Loading/Loading";

type Columns<T> = ColumnsType<T>[0];
type SorterOrder = "descend" | "ascend" | undefined;

interface RequiredColumnProps<T>
  extends Omit<Columns<T>, "onHeaderCell" | "onCell" | "title"> {
  key: Exclude<Columns<T>["key"], undefined | number>;
  dataIndex: Exclude<ColumnType<T>["dataIndex"], undefined>;
  sortable?: boolean;
  width?: number;
  // TODO: improve type
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onHeaderCell?: (column: ColumnType<T>) => any;
  onCell?: (column: T) => any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  title: React.ReactNode;
}

export interface TableProps<T extends { id: string }> {
  bordered?: boolean;
  loading?: boolean;
  error?: React.ReactNode | string;
  data: T[] | undefined;
  columns: RequiredColumnProps<T>[];
  onSorterChange?: (order: SorterOrder | null, key?: string | number) => void;
  onRowClick?: (
    record: T,
    index: number,
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
  // rowClassName?: (record: T, index: number) => string;
  scroll?: { x?: number | string | true; y?: number | string };
  onResize?: (column: RequiredColumnProps<T>[]) => void;
  resizable?: boolean;
  // TODO: improve type
  /* eslint-disable @typescript-eslint/no-explicit-any */
  components?: {
    table?: (props: any) => any;
    header?: {
      wrapper?: (props: any) => any;
      row?: (props: any) => any;
      cell?: (props: any) => any;
    };
    body?: {
      wrapper?: (props: any) => any;
      row?: (props: any) => any;
      cell?: (props: any) => any;
    };
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  RowMenu?: React.FC<{ record: T; index: number }>;
  empty?: string | React.ReactNode;
  tableLayout?: "fixed" | "auto";
  initLoading?: boolean;
  rowKey?: AntdTableProps<T>["rowKey"];
  wrapper?: React.MutableRefObject<HTMLDivElement | null>;
  onSelect?: (keys: string[], records: any[]) => void;
  selectedKeys?: string[];
  onActive?: (key: string, record: any) => void;
  activeKey?: string;
  pagination?: {
    current: number;
    pageSize: number;
  };
}

function canScroll(el: Element, direction = "vertical"): boolean {
  const overflow = window.getComputedStyle(el).getPropertyValue("overflow");

  if (overflow === "hidden") return false;

  if (direction === "vertical") {
    return el.scrollHeight > el.clientHeight;
  } else if (direction === "horizontal") {
    return el.scrollWidth > el.clientWidth;
  }

  return false;
}

const useTableBodyHasScrollBar = (
  tableBodyEl?: React.MutableRefObject<HTMLDivElement | null>,
  data?: unknown
): boolean => {
  const [hasScrollBar, setHasScrollBar] = useState<boolean>(false);
  const antTableBodyRef = useRef<Element>();
  const observeTableBodyResize = useMemo(
    () =>
      new ResizeObserver((entries) => {
        const target = entries[0].target;
        if (target) {
          setHasScrollBar(canScroll(target));
        }
      }),
    []
  );
  useEffect(() => {
    const tableWrapper = tableBodyEl?.current?.querySelector(
      ".dovetail-ant-table-body"
    );
    if (tableWrapper) {
      if (antTableBodyRef.current) {
        observeTableBodyResize.unobserve(antTableBodyRef.current);
      }
      antTableBodyRef.current = tableWrapper;
      setHasScrollBar(canScroll(antTableBodyRef.current));
      observeTableBodyResize.observe(antTableBodyRef.current);
    }
    return () => {
      observeTableBodyResize.disconnect();
    };
  }, [tableBodyEl, data, observeTableBodyResize]);
  return hasScrollBar;
};

const Table = React.forwardRef<HTMLDivElement, TableProps<{ id: string }>>(
  function Table(props, ref) {
    const {
      loading = false,
      data,
      columns,
      onSorterChange,
      onRowClick,
      scroll,
      bordered,
      components,
      onSelect,
      selectedKeys,
      onActive,
      activeKey,
      empty = "no data",
      tableLayout = "fixed",
      initLoading,
      rowKey,
      wrapper,
      pagination,
    } = props;
    const orderRef = useRef<"descend" | "ascend" | undefined | null>(null);
    const hasScrollBard = useTableBodyHasScrollBar(wrapper, data);
    let error = props.error;
    if (error instanceof Error) {
      error = error.message;
    }

    const getKey = useCallback((record: any) => {
      return typeof rowKey === "string" ? record[rowKey] : rowKey?.(record);
    }, [rowKey]);

    const finalColumns = useMemo(()=> columns.map((column) => column.sorter
    ? {
      ...column,
      title: (
        <ColumnTitle
          title={column.title}
          sortOrder={column.sortOrder} />
      ),
    }
    : column
  ), [columns]);
    const onRow = useCallback((record: any, index) => ({
      onClick: (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onRowClick?.(record, index!, evt);
        const key = getKey(record);
        onActive?.(key, record);
      },
    }), [getKey, onActive, onRowClick]);
    const onChange = useCallback((_, __, sorter) => {
      if (!(sorter instanceof Array)) {
        orderRef.current =
          sorter.order ||
          (orderRef.current === "ascend" ? "descend" : "ascend");
        onSorterChange?.(orderRef.current, sorter.columnKey);
      }
    }, [onSorterChange]);
    const rowClassName = useCallback((r) => {
      return getKey(r) === activeKey ? "active-row" : "";
    }, [activeKey, getKey]);
    const tableLoading = useMemo(()=> ({
      spinning: loading,
      indicator: initLoading ? <TableLoading /> : <Loading />,
    }), [initLoading, loading]);
    const rowSelection = useMemo(()=> onSelect && ({
      type: "checkbox" as const,
      selectedRowKeys: selectedKeys,
      onChange(keys: unknown, rows: unknown[]) {
        onSelect(keys as string[], rows);
      },
    }), [onSelect, selectedKeys]);
    const locale = useMemo(()=> ({
      emptyText: error || <>{loading ? "" : empty}</>,
    }), [empty, error, loading]);
    return (
      <div
        ref={ref}
        className={cx(TableContainerStyle, !hasScrollBard && "no-scroll-bar")}
      >
        <BaseTable
          className={cx(
            TableStyle,
            !data?.length && "empty-table",
            initLoading && "table-init-loading",
            onSelect && "has-selection"
          )}
          bordered={bordered}
          loading={tableLoading}
          locale={locale}
          dataSource={data || []}
          pagination={pagination || false}
          columns={finalColumns}
          components={components}
          rowKey={rowKey || "id"}
          tableLayout={data?.length ? tableLayout : "auto"}
          size="small"
          onChange={onChange}
          onRow={onRow}
          rowClassName={rowClassName}
          scroll={scroll}
          rowSelection={rowSelection}
          showSorterTooltip={false}
        />
      </div>
    );
  }
);

export default Table;
