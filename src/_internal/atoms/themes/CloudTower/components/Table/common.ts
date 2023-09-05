import React, {
  BaseSyntheticEvent,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import getScrollBarSize from "rc-util/lib/getScrollBarSize";
import {
  TABLE_WRAPPER_SELECTOR,
  THEAD_SELECTOR,
  TBODY_SELECTOR,
  PAGINATION_SELECTOR
} from "src/constants/table";
import useElementsSize from "../../../../hooks/useElementsSize";
import { isEqual, isNil } from "lodash";

export type TableRenderer<T, C> = (
  cell: T,
  record: C,
  index: number
) => React.ReactNode;

export function arrayMove<T>(
  arr: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (fromIndex === toIndex) return arr;
  if (fromIndex > arr.length - 1) return arr;

  const cloneArr = [...arr];
  const element = cloneArr[fromIndex];
  cloneArr.splice(fromIndex, 1);
  cloneArr.splice(toIndex, 0, element);
  return cloneArr;
}

export function handleColumnsByKeys<T extends string>(
  totalKeys: T[],
  columnKeys: Array<T | "*">
): T[] {
  const delimiterIdx = columnKeys.indexOf("*");
  if (delimiterIdx > -1) {
    columnKeys.splice(
      delimiterIdx,
      1,
      ...totalKeys.filter((key) => !columnKeys.includes(key))
    );
  }
  return columnKeys as T[];
}

export function eventStopPropagation(event: BaseSyntheticEvent) {
  event.stopPropagation();
}

export const BLANK_COLUMN = {
  title: "",
  key: "blankColumn",
  dataIndex: "",
  className: "is-blank",
};

export function canScroll(el: Element, direction = "vertical"): boolean {
  const overflow = window.getComputedStyle(el).getPropertyValue("overflow");

  if (overflow === "hidden") return false;

  if (direction === "vertical") {
    return el.scrollHeight > el.clientHeight;
  } else if (direction === "horizontal") {
    return el.scrollWidth > el.clientWidth;
  }

  return false;
}

export const useTableBodyHasScrollBar = (
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

export function tableScrollToTop(
  ref: React.MutableRefObject<HTMLDivElement | null>
): void {
  const tableBody = ref?.current?.querySelector(".ant-table-body");
  if (tableBody && tableBody.scrollTop !== 0) {
    tableBody.scrollTo(0, 0);
  }
}

type TableScrollConfig =
  | { x?: string | number; y?: string | number }
  | undefined;
export const useTransformScrollAndColumns = <T>(tableProps: {
  wrapper?: React.MutableRefObject<HTMLDivElement | null>;
  loading?: boolean;
  rowSelection?: unknown;
  data?: unknown;
  tableKey?: string;
  uniqueKey?: string;
  stickyHeader?: boolean;
  columns: T[];
  scroll?:
  | "autoHeight"
  | "auto"
  | { x?: boolean | number | string; y?: boolean | number | string };
}): [TableScrollConfig, T[]] => {
  const {
    tableKey,
    loading,
    uniqueKey,
    data,
    wrapper,
    columns,
    rowSelection,
    stickyHeader,
    scroll,
  } = tableProps;
  let finalColumns = columns;
  const defaultScroll = useRef<
    | "autoHeight"
    | "auto"
    | { x?: boolean | number | string; y?: boolean | number | string }
    | undefined
  >(scroll);
  const [scrollConfig, setScrollConfig] = useState<TableScrollConfig>({});
  const [headerAndPaginationHeight, setHeaderAndPaginationHeight] =
    useState<number>(0);
  const scrollBarSize = useMemo(
    () => (defaultScroll.current ? getScrollBarSize() : 0),
    [defaultScroll.current]
  );

  // listen scroll change
  useEffect(() => {
    if (!isEqual(scroll, defaultScroll.current)) {
      defaultScroll.current = scroll;
    }
  }, [scroll]);

  // computed header and pagination height
  useEffect(() => {
    if (wrapper?.current) {
      const headerEl = wrapper.current.querySelector(
        ".ant-table-header"
      ) as HTMLDivElement;
      const paginationEl = wrapper.current.querySelector(
        ".pagination-wrapper"
      ) as HTMLDivElement;

      setHeaderAndPaginationHeight(
        (headerEl?.offsetHeight || 0) +
        (paginationEl?.offsetHeight || 0) +
        wrapper.current.getBoundingClientRect().top
      );
    }
  }, [wrapper, data]);

  const wrapperClass = tableKey
    ? `${TABLE_WRAPPER_SELECTOR}.${tableKey}-table-wrapper`
    : TABLE_WRAPPER_SELECTOR;

  const sizes = useElementsSize(
    {
      wrapper: wrapperClass,
      pagination: `${wrapperClass} ${PAGINATION_SELECTOR}`,
      thead: `${wrapperClass} ${THEAD_SELECTOR}`,
      tbody: `${wrapperClass} ${TBODY_SELECTOR}`,
    },
    {
      prevent: loading,
      key: uniqueKey,
      dependencyList: [data],
    }
  );

  const height =
    sizes.wrapper.height - sizes.pagination.height - sizes.thead.height;
  const { totalWidth, hasAdaptive } = useMemo(() => {
    let hasAdaptive = false;
    const _columns = finalColumns as (T & { width?: number })[];
    const width = _columns.reduce<number>((prev, cur) => {
      if (!cur.width) hasAdaptive = true;

      return prev + (cur.width || 0);
    }, 0);

    const totalWidth = rowSelection ? width + 50 : width;

    return { totalWidth, hasAdaptive };
  }, [finalColumns, rowSelection]);

  // computed scroll config when wrapper size and scroll changed
  useEffect(() => {
    if (!defaultScroll.current) {
      setScrollConfig({});
      return;
    }
    const x = Math.max(sizes.wrapper.width, totalWidth);
    const y = stickyHeader
      ? "max-content"
      : sizes.tbody.height > height
        ? height
        : undefined;
    if (typeof defaultScroll.current === "object") {
      if (!isNil(defaultScroll.current.x)) {
        setScrollConfig({
          ...scrollConfig,
          x:
            typeof defaultScroll.current.x === "number"
              ? defaultScroll.current.x
              : x,
        });
      }
      if (!isNil(defaultScroll.current.y)) {
        setScrollConfig({
          ...scrollConfig,
          y:
            typeof defaultScroll.current.y === "number"
              ? defaultScroll.current.y
              : y,
        });
      }
    } else if (defaultScroll.current === "autoHeight") {
      setScrollConfig({
        x,
        y: `calc(100vh - ${headerAndPaginationHeight}px)`,
      });
    } else {
      setScrollConfig({
        x,
        y,
      });
    }
  }, [
    headerAndPaginationHeight,
    height,
    defaultScroll.current,
    sizes.tbody.height,
    sizes.wrapper.width,
    stickyHeader,
    totalWidth,
    data,
  ]);

  if (totalWidth < sizes.wrapper.width - scrollBarSize && !hasAdaptive) {
    if (
      (finalColumns as unknown as { key: string }[]).find(
        (item) => item.key === "_action_"
      )
    ) {
      (finalColumns as (T | typeof BLANK_COLUMN)[]).splice(
        finalColumns.length - 1,
        0,
        BLANK_COLUMN
      );
    } else {
      (finalColumns as (T | typeof BLANK_COLUMN)[]).splice(
        finalColumns.length,
        0,
        BLANK_COLUMN
      );
    }
  } else {
    finalColumns = finalColumns.map(col => ({
      ...col,
      width: (col as (T & { width?: number })).width || 200
    }))
  }

  return [scrollConfig, finalColumns];
};
