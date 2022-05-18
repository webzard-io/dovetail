import React from "react";
import { isPlainObject, isArray } from "lodash-es";
import { css, cx } from "@emotion/css";
import { Row } from "./_Layout";

const BranchRow = css`
  padding: 4px;

  label {
    border-left: 2px solid black;
    padding-left: 2px;
  }
`;

const OddRow = css`
  background: #ffffff;
`;
const EvenRow = css`
  background: #f2f5fa;
`;

const colors = [
  "#41efc5",
  "#ffbf00",
  "#5ed8ff",
  "#de83ed",
  "#cfec1b",
  "#8c83ed",
  "#ff9eea",
];

function flatten(value: Record<string, any>) {
  const branches: { k: string; v: any; depth: number }[] = [];

  const walk = (k: string, v: any, depth: number) => {
    if (isArray(v)) {
      v.forEach((nestValue, index) => {
        branches.push({ k, v: `${v.length} Item`, depth });
        walk(`index ${index}`, nestValue, depth + 1);
      });
    } else if (isPlainObject(v)) {
      const keys = Object.keys(v);
      branches.push({ k, v: `${keys.length} Fields`, depth });
      keys.forEach((nestK) => {
        walk(nestK, v[nestK], depth + 1);
      });
    } else {
      branches.push({ k, v, depth });
    }
  };

  Object.keys(value).forEach((k) => walk(k, value[k], 0));

  return branches;
}

const Branch: React.FC<{ k: string; v: any; depth: number; index: number }> = (
  props
) => {
  const { k, v, depth, index } = props;

  return (
    <div className={cx(Row, BranchRow, index % 2 ? EvenRow : OddRow)}>
      <label
        style={{
          marginLeft: depth * 6,
          marginRight: -depth * 6,
          borderColor: colors[depth % colors.length],
        }}
      >
        {k}
      </label>
      <div className="value">{String(v)}</div>
    </div>
  );
};

const TreeView: React.FC<{ value: Record<string, any> }> = ({ value }) => {
  return (
    <>
      {flatten(value).map((b, idx) => (
        <Branch key={idx} index={idx} {...b} />
      ))}
    </>
  );
};

export default TreeView;
