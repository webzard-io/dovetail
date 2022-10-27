import React, { useContext, useState, useEffect, useCallback } from "react";
import { KitContext } from "../atoms/kit-context";
import { KubeApi, UnstructuredList } from "../k8s-api-client/kube-api";
import styled from "@emotion/styled";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";
import ErrorContent from "../ErrorContent";
import { useTranslation } from "react-i18next";
import { css } from "@emotion/css";

const LoadingWrapper = styled.div`
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.div`
  color: rgba(10, 37, 85, 0.6);
  padding: 24px;
  text-align: center;
`;

const CardStyle = css`
  .card-body {
    padding: 24px 32px;
  }

  .dovetail-ant-btn {
    height: 18px;
  }
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
  watchWsBasePath?: string;
  resource: string;
  namespace?: string;
  apiBase: string;
  fieldSelector?: string;
  emptyText?: string;
  errorText?: string;
  onResponse?: (res: Response) => void;
  onClickItem?: (item: UnstructuredList["items"][0]) => void;
};

const KubectlGetList = React.forwardRef<HTMLElement, KubectlGetListProps>(
  ({
    basePath,
    watchWsBasePath,
    apiBase,
    namespace,
    resource,
    fieldSelector,
    emptyText,
    errorText,
    onResponse,
    onClickItem,
  }) => {
    const { t } = useTranslation();
    const kit = useContext(KitContext);
    const [response, setResponse] = useState<Response>({
      data: emptyData,
      loading: false,
      error: null,
    });
    const { data, loading, error } = response;

    const fetch = useCallback(() => {
      const api = new KubeApi<UnstructuredList>({
        basePath,
        watchWsBasePath,
        objectConstructor: {
          kind: "",
          apiBase: `${apiBase}/${resource}`,
          namespace,
        },
      });
      setResponse((prev) => ({ ...prev, loading: true }));
      return api
        .listWatch({
          query: fieldSelector ? { fieldSelector } : {},
          cb: (res) => {
            setResponse(() => ({
              loading: false,
              error: null,
              data: {
                ...res,
                items: res.items.sort(
                  (a, b) =>
                    new Date(b.metadata.creationTimestamp as string).getTime() -
                    new Date(a.metadata.creationTimestamp as string).getTime()
                ),
              },
            }));
          },
        })
        .catch((err) => {
          setResponse(() => ({ loading: false, error: err, data: emptyData }));
        });
    }, [apiBase, resource, namespace, basePath, fieldSelector]);

    useEffect(() => {
      const stopP = fetch();

      return () => {
        stopP.then((stop) => stop?.());
      };
    }, [fetch]);
    useEffect(() => {
      onResponse?.(response);
    }, [response]);

    return (
      <kit.Card className={CardStyle}>
        {(function () {
          if (loading) {
            return (
              <LoadingWrapper>
                <kit.Loading></kit.Loading>
              </LoadingWrapper>
            );
          }

          if (error) {
            return (
              <ErrorContent
                errorText={errorText}
                refetch={fetch}
              ></ErrorContent>
            );
          }

          if (data.items.length) {
            return data.items.map((item) => {
              return (
                <kit.InfoRow
                  key={item.metadata.name}
                  label={
                    <kit.Button
                      className={Typo.Label.l4_regular_title}
                      size="sm"
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
            });
          } else {
            return (
              <EmptyText className={Typo.Display.d3_bold_title}>
                {emptyText || t("dovetail.empty")}
              </EmptyText>
            );
          }
        })()}
      </kit.Card>
    );
  }
);

export default KubectlGetList;
