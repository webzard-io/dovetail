import React, { useRef, useState, useMemo, useEffect } from "react";
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

interface TableProps<T extends { id: string }> {
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
  rowClassName?: (record: T, index: number) => string;
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
  rowSelection?: TableRowSelection<T>;
  empty?: string | React.ReactNode;
  tableLayout?: "fixed" | "auto";
  initLoading?: boolean;
  rowKey?: AntdTableProps<T>["rowKey"];
  wrapper?: React.MutableRefObject<HTMLDivElement | null>;
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
    const tableWrapper = tableBodyEl?.current?.querySelector(".ant-table-body");
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
  (props, ref) => {
    const {
      loading = false,
      error,
      data,
      columns,
      onSorterChange,
      onRowClick,
      rowClassName,
      scroll,
      bordered,
      components,
      rowSelection,
      empty,
      tableLayout = "fixed",
      initLoading,
      rowKey,
      wrapper,
    } = props;
    const orderRef = useRef<"descend" | "ascend" | undefined | null>(null);
    const hasScrollBard = useTableBodyHasScrollBar(wrapper, data);

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
            rowSelection && "has-selection"
          )}
          bordered={bordered}
          loading={{
            spinning: loading,
            indicator: initLoading ? <TableLoading /> : <Loading />,
          }}
          locale={{
            emptyText: error || <>{loading ? "" : empty}</>,
          }}
          dataSource={data || []}
          pagination={false}
          columns={columns.map((column) =>
            column.sorter
              ? {
                  ...column,
                  title: (
                    <ColumnTitle
                      title={column.title}
                      sortOrder={column.sortOrder}
                    />
                  ),
                }
              : column
          )}
          components={components}
          rowKey={rowKey || "id"}
          tableLayout={data?.length ? tableLayout : "auto"}
          size="small"
          onChange={(_, __, sorter) => {
            if (!(sorter instanceof Array)) {
              orderRef.current =
                sorter.order ||
                (orderRef.current === "ascend" ? "descend" : "ascend");
              onSorterChange?.(orderRef.current, sorter.columnKey);
            }
          }}
          onRow={(record: any, index) => ({
            onClick: (evt) => onRowClick?.(record, index!, evt),
          })}
          rowClassName={rowClassName}
          scroll={scroll}
          rowSelection={rowSelection && { ...rowSelection, columnWidth: 32 }}
          showSorterTooltip={false}
        />
      </div>
    );
  }
);

export default Table;
