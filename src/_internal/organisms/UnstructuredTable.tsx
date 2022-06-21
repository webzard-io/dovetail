import React, { useContext, useEffect, useState } from "react";
import { KitContext, TableProps } from "../../_internal/atoms/kit-context";
import {
  KubeApi,
  UnstructuredList,
} from "../../_internal/k8s-api-client/kube-api";

type UnstructuredTableProps = {
  kind: string;
  namespace: string;
  apiBase: string;
  fieldSelector: string;
  onResponse?: (res: any) => void;
} & Pick<
  TableProps,
  "columns" | "onActive" | "onSelect" | "activeKey" | "selectedKeys"
>;

export const emptyData = {
  apiVersion: "",
  kind: "",
  meatadata: {},
  items: [],
};

const UnstructuredTable = React.forwardRef<HTMLElement, UnstructuredTableProps>(
  (
    {
      columns,
      apiBase,
      kind,
      namespace,
      fieldSelector,
      onActive,
      onSelect,
      activeKey,
      selectedKeys,
      onResponse,
    },
    ref
  ) => {
    const kit = useContext(KitContext);
    const [response, setResponse] = useState<{
      data: UnstructuredList;
      loading: boolean;
      error: null | Error;
    }>({
      data: emptyData,
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
            setResponse((prev) => ({ ...prev, error: null, data: res }));
          })
          .catch((err) => {
            setResponse((prev) => ({ ...prev, error: err, data: emptyData }));
          })
          .finally(() => setResponse((prev) => ({ ...prev, loading: false })));
      };
      doRequest(false);
      setInterval(() => {
        doRequest(true);
      }, 5000);
    }, [apiBase, kind, namespace]);
    useEffect(() => {
      onResponse?.(response);
    }, [response]);

    return (
      <kit.Table
        ref={ref}
        columns={columns}
        data={data.items}
        loading={loading}
        rowKey={(row) => row.metadata.name}
        activeKey={activeKey}
        onActive={onActive}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
      />
    );
  }
);

export default UnstructuredTable;
