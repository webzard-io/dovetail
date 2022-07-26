import React, { useContext, useEffect, useState } from "react";
import { KitContext, TableProps } from "../atoms/kit-context";
import {
  KubeApi,
  UnstructuredList,
} from "../k8s-api-client/kube-api";

type KubectlGetTableProps = {
  basePath: string;
  resource: string;
  namespace: string;
  apiBase: string;
  fieldSelector: string;
  onResponse?: (res: any) => void;
} & Omit<TableProps, 'data' | 'rowKey'>;

export const emptyData = {
  apiVersion: "",
  kind: "",
  metadata: {},
  items: [],
};

const KubectlGetTable = React.forwardRef<HTMLElement, KubectlGetTableProps>(
  (
    {
      basePath,
      apiBase,
      namespace,
      resource,
      fieldSelector,
      onResponse,
      ...tableProps
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
          kind: "",
          apiBase: `${apiBase}/${resource}`,
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
    }, [apiBase, resource, namespace]);
    useEffect(() => {
      onResponse?.(response);
    }, [response]);

    return (
      <kit.Table
        {...tableProps}
        ref={ref}
        data={data.items}
        error={error}
        loading={loading}
        rowKey={(row: UnstructuredList["items"][0]) =>
          `${row.metadata.namespace}/${row.metadata.name}`
        }
      />
    );
  }
);

export default KubectlGetTable;
