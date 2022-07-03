import React, { useState, useMemo } from "react";
import isPlainObject from "lodash/isPlainObject";
import isArray from "lodash/isArray";
import { css, cx } from "@emotion/css";
import { Row } from "./style/Layout.style";

const BranchRow = css`
  padding: 4px;

  label {
    border-left: 2px solid black;
    padding-left: 4px;
  }
`;

const OddRow = css`
  background: #ffffff;
`;
const EvenRow = css`
  background: #f2f5fa;
`;
const LightRow = css`
  color: #a3b4cc;
`;
const NotLeaf = css`
  cursor: pointer;

  label {
    cursor: pointer;
  }
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

type BranchData = {
  k: string;
  v: any;
  depth: number;
  leaf: boolean;
  path: string;
};

function flatten(value: Record<string, any>): BranchData[] {
  const branches: BranchData[] = [];

  const walk = (k: string, v: any, depth: number, p: string) => {
    const path = `${p}/${k}`;
    if (isArray(v)) {
      branches.push({
        k,
        v: `${v.length} Item(s)`,
        depth,
        leaf: false,
        path,
      });
      v.forEach((nestValue: any, index: number) => {
        walk(`index ${index}`, nestValue, depth + 1, `${path}/index`);
      });
    } else if (isPlainObject(v)) {
      const keys = Object.keys(v);
      branches.push({
        k,
        v: `${keys.length} Fields`,
        depth,
        leaf: false,
        path,
      });
      keys.forEach((nestK) => {
        walk(nestK, v[nestK], depth + 1, path);
      });
    } else {
      branches.push({ k, v, depth, leaf: true, path });
    }
  };

  Object.keys(value).forEach((k) => walk(k, value[k], 0, ""));

  return branches;
}

const Branch: React.FC<
  BranchData & {
    index: number;
    onToggle?: () => void;
  }
> = (props) => {
  const { k, v, depth, index, leaf, onToggle } = props;
  const light = String(v).includes("Fields") || String(v).includes("Items");

  return (
    <div
      className={cx(
        Row,
        BranchRow,
        index % 2 ? EvenRow : OddRow,
        light && LightRow,
        !leaf && NotLeaf
      )}
      onClick={leaf ? undefined : onToggle}
    >
      <label
        style={{
          marginLeft: depth * 8,
          marginRight: -depth * 8,
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
  const [expand, setExpand] = useState<Set<string>>(new Set());
  const branches = useMemo(() => {
    const _branches = flatten(value);
    const filtered: BranchData[] = [];

    let inCollapse = true;
    let expandDepth = 0;
    for (let idx = 0; idx < _branches.length; idx++) {
      const b = _branches[idx];

      if (expand.has(b.path) && expandDepth === b.depth) {
        inCollapse = false;
        expandDepth = b.depth + 1;
      }
      if (inCollapse && b.depth > expandDepth) {
        continue;
      }
      if (!expand.has(b.path) && b.depth !== expandDepth + 1) {
        inCollapse = true;
        expandDepth = b.depth;
      }
      filtered.push(b);
    }

    return filtered;
  }, [value, expand]);

  return (
    <>
      {branches.map((b, idx) => (
        <Branch
          key={b.path}
          index={idx}
          {...b}
          onToggle={() => {
            const clone = new Set(expand);
            if (clone.has(b.path)) {
              clone.delete(b.path);
            } else {
              clone.add(b.path);
            }
            setExpand(clone);
          }}
        />
      ))}
    </>
  );
};

export default TreeView;
