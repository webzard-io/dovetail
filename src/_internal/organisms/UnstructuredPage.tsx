import React, { useContext, useEffect, useState } from "react";
import { css } from "@emotion/css";
import { KitContext } from "../atoms/kit-context";
import ObjectMeta from "../molecules/ObjectMeta";
import ObjectSpec from "../molecules/ObjectSpec";
import ObjectStatus from "../molecules/ObjectStatus";
import {
  KubeApi,
  UnstructuredList,
  Unstructured,
} from "../k8s-api-client/kube-api";

type Response = {
  data: Unstructured | null;
  loading: boolean;
  error: null | Error;
};

type UnstructuredPageProps = {
  basePath: string;
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

const Page = css`
  padding: 16px;
  background: $white;
  border-radius: 8px;
  color: $text-light-primary;
  overflow: auto;
`;

const Divider = css`
  width: 100%;
  height: 1px;
  background: rgba(211, 218, 235, 0.6);
  margin: 3px 0;
`;

const UnstructuredPage = React.forwardRef<
  HTMLDivElement,
  UnstructuredPageProps
>(({ basePath, kind, apiBase, namespace, fieldSelector, onResponse }, ref) => {
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
      basePath,
      objectConstructor: {
        kind,
        apiBase,
        namespace,
      },
    });
    setResponse((prev) => ({ ...prev, loading: true }));
    const stopP = api
      .listWatch({
        query: fieldSelector ? { fieldSelector } : {},
        cb: (res) => {
          setResponse(() => ({
            loading: false,
            error: null,
            data: res.items[0] || null,
          }));
        },
      })
      .catch((err) => {
        setResponse(() => ({ loading: false, error: err, data: null }));
      });
    return () => {
      stopP.then((stop) => stop?.());
    };
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
    <div className={Page} ref={ref}>
      {getContent()}
    </div>
  );
});

export default UnstructuredPage;
