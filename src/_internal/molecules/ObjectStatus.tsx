import React from "react";
import { Unstructured } from "../k8s-api-client/kube-api";
import TreeView from "./TreeView";

const _ObjectStatus = React.forwardRef<
  HTMLDivElement,
  {
    item?: Unstructured & { status?: any } & Record<string, any>;
    className?: string;
  }
>(function _ObjectStatus(props, ref) {
  const { className, item } = props;
  if (!item?.status) {
    return null;
  }

  return (
    <div className={className} ref={ref}>
      {/* status */}
      <TreeView value={item.status} />
    </div>
  );
});

export default _ObjectStatus;
