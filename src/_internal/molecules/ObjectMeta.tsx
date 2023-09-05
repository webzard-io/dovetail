import React, { useContext } from "react";
import { formatDuration } from "../utils/date";
import { Unstructured } from "../k8s-api-client/kube-api";
import { kitContext } from "@cloudtower/eagle";
import { Row } from "./style/Layout.style";

function kvToArr(
  raw: Record<string, string> = {}
): { key: string; value: string }[] {
  return Object.keys(raw).map((key) => ({ key, value: raw[key] }));
}

const _ObjectMeta = React.forwardRef<
  HTMLDivElement,
  {
    item?: Unstructured & Record<string, any>;
    className?: string;
    showName?: boolean;
  }
>(function _ObjectMeta(props, ref) {
  const { className, item, showName } = props;
  const kit = useContext(kitContext);
  if (!item) {
    return null;
  }

  return (
    <div className={className} ref={ref}>
      {/* metadata */}
      <div>
        {item.metadata.creationTimestamp && (
          <div className={Row}>
            <label>创建时间：</label>
            <div className="value">
              {formatDuration(item.metadata.creationTimestamp)}(
              {item.metadata.creationTimestamp})
            </div>
          </div>
        )}
        {item.metadata.name && showName && (
          <div className={Row}>
            <label>名称：</label>
            <div className="value">{item.metadata.name}</div>
          </div>
        )}
        {item.metadata.namespace && (
          <div className={Row}>
            <label>Namespace：</label>
            <div className="value">{item.metadata.namespace}</div>
          </div>
        )}
        {item.metadata.uid && (
          <div className={Row}>
            <label>UID：</label>
            <div className="value">{item.metadata.uid}</div>
          </div>
        )}
        {item.metadata.selfLink && (
          <div className={Row}>
            <label>Link:</label>
            <div className="value">{item.metadata.selfLink}</div>
          </div>
        )}
        {item.metadata.resourceVersion && (
          <div className={Row}>
            <label>Resource Version:</label>
            <div className="value">{item.metadata.resourceVersion}</div>
          </div>
        )}
        {item.metadata.labels && (
          <div className={Row}>
            <label>Labels:</label>
            <div className="value">
              {kvToArr(item.metadata.labels).map((label, idx) => {
                return (
                  <kit.tag key={idx}>
                    {label.key}/{label.value}
                  </kit.tag>
                );
              })}
            </div>
          </div>
        )}
        {item.metadata.annotations && (
          <div className={Row}>
            <label>Annotations:</label>
            <div className="value">
              {kvToArr(item.metadata.annotations).map((label, idx) => {
                return (
                  <kit.tag key={idx}>
                    {label.key}/{label.value}
                  </kit.tag>
                );
              })}
            </div>
          </div>
        )}
        {item.metadata.finalizers && (
          <div className={Row}>
            <label>Finalizers:</label>
            <div className="value">
              {item.metadata.finalizers.map((f, idx) => {
                return <kit.tag key={idx}>{f}</kit.tag>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default _ObjectMeta;
