import { useEffect } from "react";
import { cx } from "@linaria/core";
import { useMeasure } from "react-use";
import Icon from "../Icon/Icon";
import { TableLoadingStyle } from "./Table.style";

export const ColumnTitle: React.FC<{
  sortOrder?: "descend" | "ascend" | null;
  title: React.ReactNode;
}> = (props) => {
  const { title, sortOrder } = props;
  return (
    <>
      {title}
      {
        <Icon
          className={cx("order-icon", sortOrder)}
          type="1-arrow-chevron-up-16-bold-secondary"
        />
      }
    </>
  );
};

export const TableLoading: React.FC = () => {
  const [ref, sizes] = useMeasure();
  useEffect(() => {
    const spinEl = document.querySelector(
      ".dovetail-ant-table-wrapper .dovetail-ant-spin"
    );
    if (spinEl) {
      ref(spinEl);
    }
  }, []);

  const rowLength = Math.floor(sizes.height + 8 / 40) || 20;
  const rows = Array.from({ length: rowLength }, (r, i) => i);
  return (
    <div className={cx(TableLoadingStyle, "table-loading")}>
      {rows.map((i) => (
        <div key={i} className="table-loading-item">
          <div className="checkbox-loading"></div>
          <div className="td-loading"></div>
          <div className="td-loading"></div>
          <div className="td-loading"></div>
        </div>
      ))}
    </div>
  );
};
