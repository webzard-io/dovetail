import React, { useContext, useState, useEffect, useCallback } from "react";
import { KitContext } from "../atoms/kit-context";
import { KubeApi, UnstructuredList } from "../k8s-api-client/kube-api";
import styled from "@emotion/styled";

const LoadingWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const emptyData = {
  apiVersion: "",
  kind: "",
  metadata: {},
  items: [],
};

export type Response = {
  data: UnstructuredList;
  loading: boolean;
  error: null | Error;
};

type KubectlGetListProps = {
  className?: string;
  basePath: string;
  resource: string;
  namespace?: string;
  apiBase: string;
  fieldSelector?: string;
  onResponse?: (res: Response) => void;
  onClickItem?: (item: UnstructuredList["items"][0]) => void;
};

const KubectlGetList = React.forwardRef<HTMLElement, KubectlGetListProps>(
  ({
    basePath,
    apiBase,
    namespace,
    resource,
    fieldSelector,
    onResponse,
    onClickItem,
  }) => {
    const kit = useContext(KitContext);
    const [response, setResponse] = useState<Response>({
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
    }, [apiBase, resource, namespace, basePath, fieldSelector]);
    useEffect(() => {
      onResponse?.(response);
    }, [response]);

    return (
      <kit.Card>
        {loading ? (
          <LoadingWrapper>
            <kit.Loading></kit.Loading>
          </LoadingWrapper>
        ) : null}
        {data.items.map((item) => {
          return (
            <kit.InfoRow
              key={item.metadata.name}
              label={
                <kit.Button
                  type="link"
                  onClick={() => {
                    onClickItem?.(item);
                  }}
                >
                  {item.metadata.name}
                </kit.Button>
              }
              content=""
            />
          );
        })}
      </kit.Card>
    );
  }
);

export default KubectlGetList;
