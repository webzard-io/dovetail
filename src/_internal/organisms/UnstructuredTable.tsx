import React, { useContext, useEffect, useState } from "react";
import { KitContext, TableProps } from "../../_internal/atoms/kit-context";
import {
  KubeApi,
  UnstructuredList,
} from "../../_internal/k8s-api-client/kube-api";

type UnstructuredTableProps = {
  basePath: string;
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
  metadata: {},
  items: [],
};

const UnstructuredTable = React.forwardRef<HTMLElement, UnstructuredTableProps>(
  (
    {
      basePath,
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
            setResponse(() => ({ loading: false, error: null, data: res }));
          },
        })
        .catch((err) => {
          setResponse(() => ({ loading: false, error: err, data: emptyData }));
        });

      return () => {
        stopP.then((stop) => stop?.());
      };
    }, [apiBase, kind, namespace]);
    useEffect(() => {
      onResponse?.(response);
    }, [response]);

    return (
      <kit.Table
        ref={ref}
        columns={columns}
        data={data.items}
        error={error}
        loading={loading}
        rowKey={(row) => `${row.metadata.namespace}/${row.metadata.name}`}
        activeKey={activeKey}
        onActive={onActive}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
      />
    );
  }
);

export default UnstructuredTable;
