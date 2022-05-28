import React, { useContext, useEffect, useState } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { css } from "@emotion/css";
import { KitContext } from "../../themes/theme-context";
import _ObjectMeta from "../../_internal/components/_ObjectMeta";
import _ObjectSpec from "../../_internal/components/_ObjectSpec";
import _ObjectStatus from "../../_internal/components/_ObjectStatus";
import {
  KubeApi,
  UnstructuredList,
  Unstructured,
} from "../../_internal/k8s-api/kube-api";

const UnstructuredCardProps = Type.Object({
  kind: Type.String({
    description: "K8s resource kind, e.g, Deployment",
  }),
  namespace: Type.String({
    description: "namespace filter",
  }),
  apiBase: Type.String({
    description: "K8s resource api base, e.g, /apis/apps/v1/deployments",
  }),
  fieldSelector: Type.String(),
});

const UnstructuredCardState = Type.Object({
  item: Type.Any(),
});

const Header = css`
  display: flex;
  line-height: 22px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3a56;
  margin: 16px 0;
`;

const Card = css`
  padding: 16px;
  background: $white;
  border-radius: 8px;
  color: $text-light-primary;
  border: 1px solid $strokes-light-trans-2;
  box-shadow: 0px 0px 16px rgba(107, 125, 153, 0.075),
    0px 0px 2.00345px rgba(107, 125, 153, 0.15);
  width: 500px;
  max-height: 400px;
  overflow: auto;
`;

const Divider = css`
  width: 100%;
  height: 1px;
  background: rgba(211, 218, 235, 0.6);
  margin: 3px 0;
`;

export const UnstructuredCard = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_card",
    displayName: "Unstructured Card",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 4],
    exampleProperties: {
      kind: "Deployment",
      apiBase: "apis/apps/v1/deployments",
      defaultVisible: true,
    },
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: UnstructuredCardProps,
    state: UnstructuredCardState,
    methods: {},
    slots: {},
    styleSlots: [],
    events: [],
  },
})(
  ({
    kind,
    apiBase,
    namespace,
    fieldSelector,
    elementRef,
    callbackMap,
    mergeState,
    subscribeMethods,
  }) => {
    const kit = useContext(KitContext);
    const [{ data, loading, error }, setResponse] = useState<{
      data: Unstructured | null;
      loading: boolean;
      error: null | Error;
    }>({
      data: null,
      loading: false,
      error: null,
    });
    useEffect(() => {
      const api = new KubeApi<UnstructuredList>({
        objectConstructor: {
          kind,
          apiBase,
          namespace,
        },
      });
      const doRequest = (s: boolean) => {
        setResponse((prev) => ({ ...prev, loading: s ? false : true }));
        api
          .list({ query: fieldSelector ? { fieldSelector } : {} })
          .then((res) => {
            setResponse((prev) => ({
              ...prev,
              error: null,
              data: res.items[0] || null,
            }));
          })
          .catch((err) => {
            setResponse((prev) => ({ ...prev, error: err, data: null }));
          })
          .finally(() => setResponse((prev) => ({ ...prev, loading: false })));
      };
      doRequest(false);
      setInterval(() => {
        doRequest(true);
      }, 10000);
    }, [apiBase, kind, namespace]);
    useEffect(() => {
      mergeState({
        item: data,
      });
    }, [data]);

    const getContent = () => {
      if (loading) {
        return <kit.Loading />;
      }
      if (error) {
        const errorStr = String(error);
        if (errorStr.includes("404")) {
          return <>Not Found</>;
        }
        return <>{String(error)}</>;
      }
      if (!data) {
        return <>Not Found</>;
      }
      return (
        <>
          <div className={Header}>{data?.metadata.name}</div>
          <_ObjectMeta item={data} />
          <div className={Divider}></div>
          <div className={Header}>Spec</div>
          <_ObjectSpec item={data} />
          <div className={Divider}></div>
          <div className={Header}>Status</div>
          <_ObjectStatus item={data} />
        </>
      );
    };

    return (
      <div className={Card} ref={elementRef}>
        {getContent()}
      </div>
    );
  }
);
