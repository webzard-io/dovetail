import React from "react";
import { css, cx } from "@linaria/core";
import { arrayMove } from "./common";
import { useCustomizeColumn, CustomizeColumnType } from "./customize-column";

const thCss = css`
  background: white;
  .insert-left-tip,
  .insert-right-tip {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgba(0, 0, 255, 0.5);
  }
  .insert-left-tip {
    left: 0px;
  }
  .insert-right-tip {
    right: 0px;
  }
  &.on-dragenter-left .insert-left-tip {
    display: block;
  }
  &.on-dragenter-right .insert-right-tip {
    display: block;
  }
`;

export interface HeaderCellProps {
  draggable: boolean;
  resizable: boolean;
  index: number;
  sortable: boolean;
  className: string;
  components?: {
    table?: (props: Record<string, unknown>) => React.ReactElement;
    header?: {
      wrapper?: (props: Record<string, unknown>) => React.ReactElement;
      row?: (props: Record<string, unknown>) => React.ReactElement;
      cell?: (props: Record<string, unknown>) => React.ReactElement;
    };
    body?: {
      wrapper?: (props: Record<string, unknown>) => React.ReactElement;
      row?: (props: Record<string, unknown>) => React.ReactElement;
      cell?: (props: Record<string, unknown>) => React.ReactElement;
    };
  };
  children?: React.ReactNode;
  auxiliaryLine: React.RefObject<HTMLDivElement>;
  wrapper: React.RefObject<HTMLDivElement>;
  defaultCustomizeColumn: [
    string,
    CustomizeColumnType[] | (() => CustomizeColumnType[])
  ];
  onMouseEnter?: (
    event: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>
  ) => void;
  onMouseLeave?: (
    event: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>
  ) => void;
}
type DragEvent = React.DragEvent<HTMLTableHeaderCellElement>;

let dragColumnIndex = 0;

function HeaderCell(props: HeaderCellProps) {
  const {
    draggable,
    resizable,
    index,
    sortable,
    className,
    components,
    auxiliaryLine,
    wrapper,
    defaultCustomizeColumn,
    onMouseEnter,
    onMouseLeave,
    ...restProps
  } = props;
  const Th = components?.header?.cell || "th";
  const line = auxiliaryLine.current!;

  const [customizeColumn, setCustomizeColumn] = useCustomizeColumn(
    ...defaultCustomizeColumn
  );

  if (
    className.includes("ant-tablezhichenasd-selection-column") ||
    typeof index !== "number"
  ) {
    return <Th {...restProps} className={className} />;
  }

  const key = customizeColumn[index]?.key;

  const columns = customizeColumn.filter(colum => colum.display);
  const domIndex = columns.findIndex(column => column.key === key);

  const draggableProps = draggable
    ? {
        draggable: true,
        onDragStart: (event: DragEvent) => {
          const isWidthDraging =
            line.style.transform &&
            line.style.transform !== "translateX(-9999px)";

          if (isWidthDraging) {
            event.preventDefault();
            return;
          }
          dragColumnIndex = index;
        },
        onDragEnter: (event: DragEvent) => {
          if (dragColumnIndex === index || !sortable) return;
          const klass =
            dragColumnIndex > index
              ? "on-dragenter-left"
              : "on-dragenter-right";

          const th = (event.target as HTMLElement).closest("th")!;
          const classList = th.classList;
          classList.contains(klass) || classList.add(klass);
        },
        onDragLeave: (event: DragEvent) => {
          if (dragColumnIndex === index) return;
          const th = (event.target as HTMLElement).closest("th")!;
          if (!th.contains(event.relatedTarget as HTMLElement)) {
            th.classList.remove("on-dragenter-left", "on-dragenter-right");
          }
        },
        onDragOver: (event: DragEvent) => event.preventDefault(),
        onDrop: (event: DragEvent) => {
          if (dragColumnIndex === index) return;
          if (!sortable) {
            console.warn("fixed column not involved in sorting");
            return;
          }
          setCustomizeColumn(val => {
            return arrayMove(val, dragColumnIndex, index);
          });
          const th = (event.target as HTMLElement).closest("th")!;
          th.classList.remove("on-dragenter-left", "on-dragenter-right");
        },
      }
    : {
        // fixed column
        draggable: false,
        onDragStart: (event: DragEvent) => {
          const target = event.target as HTMLElement;
          // need to allow children draggable if explicit draggable attribute true
          if (
            "draggable" in target &&
            target.draggable &&
            target.getAttribute("draggable") === "true"
          ) {
            return;
          }
          event.preventDefault();
          return;
        },
      };
  const draggableChildren = draggable && (
    <>
      <i className="insert-left-tip" />
      <i className="insert-right-tip" />
    </>
  );

  const handleMousedown = ($event: React.MouseEvent) => {
    document.documentElement.classList.add("disable-select");
    const tableOffsetY = wrapper.current!.getBoundingClientRect().left;
    wrapper.current?.classList.add("dragging");
    const startMouseLeft = $event.clientX;
    let dragDistance = 0;
    line.style.transform = `translateX(${startMouseLeft - tableOffsetY}px)`;

    const table =
      wrapper.current?.querySelector(".ant-table-scroll") || wrapper.current;

    const columnWidth = table
      ?.querySelector(`.cell_${customizeColumn[index].key}`)
      ?.getBoundingClientRect().width;

    if (!columnWidth) return;

    const minDragDistance = 90 - columnWidth;

    const handleMouseMove = (event: MouseEvent) => {
      const initDrag = event.clientX - startMouseLeft;
      dragDistance = Math.max(initDrag, minDragDistance);

      if (dragDistance === initDrag) {
        line.style.transform = `translateX(${event.clientX - tableOffsetY}px)`;
      }
    };

    const handleMouseUp = () => {
      setCustomizeColumn(val => {
        val[index].width =
          val[index].width &&
          val[index].width! * (dragDistance / columnWidth + 1);
        return val;
      });

      line.style.transform = "translateX(-9999px)";
      document.documentElement.classList.remove("disable-select");
      wrapper.current?.classList.remove("dragging");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resizableChildren = resizable &&
    domIndex !== -1 &&
    domIndex < columns.length - 1 && (
      <div
        className="drag"
        onMouseDown={($event: React.MouseEvent) => handleMousedown($event)}
      />
    );

  return (
    <Th
      {...restProps}
      {...draggableProps}
      onMouseEnter={e => {
        onMouseEnter?.(e);
        wrapper.current?.querySelectorAll(`td.cell_${key}`).forEach(item => {
          item.classList.add("header-hover");
        });
      }}
      onMouseLeave={e => {
        onMouseLeave?.(e);
        wrapper.current?.querySelectorAll(`td.cell_${key}`).forEach(item => {
          item.classList.remove("header-hover");
        });
      }}
      className={cx(
        className,
        thCss,
        key && `cell_${customizeColumn[index].key}`
      )}>
      {restProps.children}
      {draggableChildren}
      {resizableChildren}
    </Th>
  );
}

export default HeaderCell;
