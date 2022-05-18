import React, { useContext } from "react";
import { Unstructured } from "../k8s-api/kube-api";
import { KitContext } from "../../themes/theme-context";
import TreeView from "./_TreeView";

const _ObjectStatus = React.forwardRef<
  HTMLDivElement,
  {
    item?: Unstructured & { status?: any } & Record<string, any>;
    className?: string;
  }
>((props, ref) => {
  const { className, item } = props;
  const kit = useContext(KitContext);
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
