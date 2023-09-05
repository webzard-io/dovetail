import React, { useEffect, useContext } from "react";
import { cx, css } from "@linaria/core";
import { styled } from "@linaria/react";
import { useMeasure } from "react-use";
import Icon from "../Icon/Icon";
import { TableLoadingStyle } from "./Table.style";
import { kitContext } from "@cloudtower/eagle";

type SearchOperation = {
  pick?: string | string[];
  omit?: string | string[];
  preventRender?: boolean;
  control?: "push" | "replace";
};

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
      ".ant-table-wrapper .ant-spin"
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

const TablePaginationStyle = css``;

export const TablePagination = <T,>(props: {
  count?: number;
  skip: number;
  size: number;
  setQuery: (
    val: T | ((val: T) => T),
    operation?: SearchOperation | undefined
  ) => void;
  onChange?: (page?: number, size?: number) => void;
}) => {
  const { count, skip, size, setQuery, onChange } = props;
  const kit = useContext(kitContext);

  useEffect(() => {
    if (!count || skip < count) return;
    setQuery((query) => ({
      ...query,
      first: size,
      // reset skip when size changed
      skip: 0,
    }));
  }, [skip, count, setQuery, size]);

  return (
    <kit.pagination
      current={(skip || 0) / size + 1}
      count={count || 0}
      size={size}
      className={TablePaginationStyle}
      onChange={(page) => {
        setQuery((query) => ({
          ...query,
          skip: (page - 1) * size,
        }));
        if (typeof onChange === "function") {
          onChange(page, undefined);
        }
      }}
      onSizeChange={(newSize) => {
        setQuery((query) => ({
          ...query,
          first: newSize,
          // reset skip when size changed
          skip: 0,
        }));
        if (typeof onChange === "function") {
          onChange(undefined, newSize);
        }
      }}
    />
  );
};

export const AuxiliaryLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 1px;
  background: $blue-60;
  transform: translateX(-9999px);
  z-index: 999;

  &::before {
    content: "";
    position: absolute;
    height: 34px;
    width: 3px;
    top: 0;
    left: -1px;
    background: $blue-60;
  }
`;
