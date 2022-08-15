import React, { useContext, useEffect, useState } from "react";
import compact from "lodash/compact";
import {
  KubeApi,
  Unstructured,
  UnstructuredList,
} from "../../k8s-api-client/kube-api";
import { KitContext } from "../../atoms/kit-context";
import { get } from "lodash";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { Typo } from "../../atoms/themes/CloudTower/styles/typo.style";

const RowStyle = css`
  .col-content {
    flex: 1;
  }
`;
const InfoListBlock = styled.div`
  padding: 16px 24px;

  &:not(:last-child) {
    box-shadow: inset 0px -1px 0px rgba(225, 230, 241, 0.6);
  }
`;
const ValueWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
const TabContentWrapper = styled.div`
  padding: 24px 0;
`;

type DetailResponse = {
  data: Unstructured | null;
  loading: boolean;
  error: null | Error;
};

export type Item = {
  label: string;
  path: string;
  widget?: string;
  widgetOptions?: Record<string, any>;
  transform?: (
    params: { path: string },
    data: { value: string; detail: Unstructured }
  ) => any;
};

type RenderFieldParams = {
  tab?: string;
  section: string;
  category: string;
} & Omit<Item, "transform">;

export type Info = Record<string, Item[]>;

export type Section = {
  title: string;
  info: Info;
};

export type Tab = {
  key: string;
  label: string;
  sections: Section[];
};

export type Layout = {
  type: "simple" | "tabs";
  tabs?: Tab[];
  sections?: Section[];
};

type KubectlGetDetailProps = {
  basePath: string;
  apiBase: string;
  namespace?: string;
  resource: string;
  name: string;
  layout: Layout;
  renderTab?: (
    params: { tab: string; tabIndex: number },
    data: { detail: Unstructured | null },
    fallback: React.ReactNode
  ) => React.ReactNode;
  renderSection?: (
    params: { tab?: string; tabIndex?: number; section: string },
    data: { detail: Unstructured | null },
    fallback: React.ReactNode
  ) => React.ReactNode;
  renderKey?: (
    params: RenderFieldParams,
    data: { value: any; detail: Unstructured | null }
  ) => React.ReactNode;
  renderValue?: (
    params: RenderFieldParams,
    data: { value: any; detail: Unstructured | null }
  ) => React.ReactNode;
  renderAction?: (
    params: RenderFieldParams,
    data: { value: any; detail: Unstructured | null }
  ) => React.ReactNode;
  onResponse?: (res: DetailResponse) => void;
  onTabChange?: (key: string) => void;
};

const KubectlGetDetail = React.forwardRef<
  HTMLDivElement,
  KubectlGetDetailProps
>((props, ref) => {
  const {
    basePath,
    apiBase,
    namespace,
    resource,
    name,
    layout,
    renderTab,
    renderSection,
    renderKey,
    renderValue,
    renderAction,
    onResponse,
  } = props;
  const kit = useContext(KitContext);
  const [response, setResponse] = useState<DetailResponse>({
    data: null,
    loading: false,
    error: null,
  });
  const [activeTab, setActiveTab] = useState<string>("");
  const { data, loading, error } = response;

  const onTabChange = (key: string) => {
    setActiveTab(key);
    props.onTabChange?.(key);
  };

  useEffect(() => {
    onResponse?.(response);
  }, [response]);
  useEffect(() => {
    const api = new KubeApi<UnstructuredList>({
      basePath: basePath,
      objectConstructor: {
        apiBase: `${apiBase}/${resource}`,
        kind: "",
        namespace,
      },
    });

    setResponse((prev) => ({ ...prev, loading: true }));
    const stopP = api
      .listWatch({
        query: {
          fieldSelector: compact([
            `metadata.name=${name}`,
            namespace && `metadata.namespace=${namespace}`,
          ]),
        },
        cb: (res) => {
          setResponse(() => ({
            loading: false,
            error: null,
            data: res.items[0],
          }));
        },
      })
      .catch((err) => {
        setResponse(() => ({ loading: false, error: err, data: null }));
      });

    return () => {
      stopP.then((stop) => stop?.());
    };
  }, [basePath, apiBase, namespace, resource, name]);

  const renderSections = (
    sections: Section[],
    context?: { tab: string; tabIndex: number }
  ) => {
    return sections.map((section) => {
      const sectionFallback = (
        <div key={section.title}>
          {section.title ? (
            <h2
              className={Typo.Heading.h2_bold_title}
              style={{ marginBottom: "16px" }}
            >
              {section.title}
            </h2>
          ) : null}
          <kit.Card>
            {Object.keys(section.info).map((category) => {
              const items = section.info[category];

              return (
                <InfoListBlock key={category}>
                  {items.map((item, index) => {
                    const value = get(data, item.path);
                    const params = {
                      ...item,
                      ...(context || {}),
                      section: section.title,
                      category,
                    };
                    return (
                      <kit.InfoRow
                        key={item.path || item.label}
                        className={RowStyle}
                        label={
                          renderKey?.(params, { value, detail: data }) ||
                          item.label
                        }
                        content={
                          <ValueWrapper>
                            <span>
                              {renderValue?.(params, { value, detail: data }) ||
                                value}
                            </span>
                            {renderAction?.(params, { value, detail: data })}
                          </ValueWrapper>
                        }
                      />
                    );
                  })}
                </InfoListBlock>
              );
            })}
          </kit.Card>
        </div>
      );

      return (
        renderSection?.(
          { ...(context || {}), section: section.title },
          { detail: data },
          sectionFallback
        ) || sectionFallback
      );
    });
  };
  let content = null;

  switch (layout.type) {
    case "simple": {
      content = renderSections(layout.sections || []);
      break;
    }
    case "tabs": {
      content = (
        <kit.TabMenu
          selectedKey={activeTab}
          tabs={(layout.tabs || []).map((tab, tabIndex) => {
            const tabFallback = renderSections(tab.sections || [], {
              tab: tab.key,
              tabIndex,
            });

            return {
              key: tab.key,
              title: tab.label,
              children: (
                <TabContentWrapper>
                  {renderTab?.(
                    { tab: tab.key, tabIndex },
                    { detail: data },
                    tabFallback
                  ) || tabFallback}
                </TabContentWrapper>
              ),
            };
          })}
          onChange={onTabChange}
        ></kit.TabMenu>
      );
    }
  }

  return <div ref={ref}>{content}</div>;
});

export default KubectlGetDetail;
