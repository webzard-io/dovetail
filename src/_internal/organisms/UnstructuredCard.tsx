import React, { useContext, useEffect, useState } from "react";
import { css } from "@emotion/css";
import { KitContext } from "../../_internal/atoms/kit-context";
import ObjectMeta from "../../_internal/molecules/ObjectMeta";
import ObjectSpec from "../../_internal/molecules/ObjectSpec";
import ObjectStatus from "../../_internal/molecules/ObjectStatus";
import {
  KubeApi,
  UnstructuredList,
  Unstructured,
} from "../../_internal/k8s-api-client/kube-api";

type Response = {
  data: Unstructured | null;
  loading: boolean;
  error: null | Error;
};

type UnstructuredCardProps = {
  kind: string;
  namespace: string;
  apiBase: string;
  fieldSelector: string;
  onResponse?: (res: Response) => void;
};

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

const UnstructuredCard = React.forwardRef<
  HTMLDivElement,
  UnstructuredCardProps
>(({ kind, apiBase, namespace, fieldSelector, onResponse }, ref) => {
  const kit = useContext(KitContext);
  const [response, setResponse] = useState<{
    data: Unstructured | null;
    loading: boolean;
    error: null | Error;
  }>({
    data: null,
    loading: false,
    error: null,
  });
  const { data, loading, error } = response;
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
    onResponse?.(response);
  }, [response]);

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
        <ObjectMeta item={data} />
        <div className={Divider}></div>
        <div className={Header}>Spec</div>
        <ObjectSpec item={data} />
        <div className={Divider}></div>
        <div className={Header}>Status</div>
        <ObjectStatus item={data} />
      </>
    );
  };

  return (
    <div className={Card} ref={ref}>
      {getContent()}
    </div>
  );
});

export default UnstructuredCard;
