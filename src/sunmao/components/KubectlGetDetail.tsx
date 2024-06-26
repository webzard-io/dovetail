import React, { useCallback, useState, useEffect, useMemo } from "react";
import { KubeSdk, Unstructured } from "../../_internal/k8s-api-client/kube-api";
import { Type } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { StringUnion, PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import BaseKubectlGetDetail from "../../_internal/organisms/KubectlGetDetail/KubectlGetDetail";
import {
  DISPLAY_WIDGETS_MAP,
  DISPLAY_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/display";
import { renderWidget } from "../utils/widget";
import { css as ecss } from "@emotion/css";

const WIDGET_CATEGORY = "Widget";

const InfoSpec = Type.Object(
  {
    label: Type.String({
      title: "Label",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    key: Type.String({
      title: "Key",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    path: Type.String({
      title: "Path",
      widget: "kui/v1/PathWidget",
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    condition: Type.Boolean({
      title: "Condition",
      default: true,
      category: PRESET_PROPERTY_CATEGORY.Basic,
    }),
    widget: StringUnion(
      ["default", "component"].concat(Object.keys(DISPLAY_WIDGETS_MAP)),
      {
        title: "Widget",
        category: WIDGET_CATEGORY,
      }
    ),
    widgetOptions: Type.Record(Type.String(), Type.Any(), {
      title: "Widget options",
      widget: "kui/v1/OptionsWidget",
      widgetOptions: {
        optionsMap: DISPLAY_WIDGET_OPTIONS_MAP,
      },
      category: WIDGET_CATEGORY,
    }),
    componentId: Type.String({
      title: "Component ID",
      isComponentId: true,
      widget: "kui/v1/CustomComponentWidget",
      widgetOptions: {
        isDisplayLabel: false,
        keyOfPath: "path",
        slot: "value",
      },
      conditions: [
        {
          key: "widget",
          value: "component",
        },
      ],
      category: WIDGET_CATEGORY,
    }),
  },
  {
    widget: "kui/v1/KubectlGetDetailFieldWidget",
  }
);

const SectionSpec = Type.Object({
  title: Type.String({
    title: "Title",
  }),
  collapsible: Type.Boolean({
    title: "Collapsible"
  }),
  info: Type.Record(
    Type.String(),
    Type.Array(InfoSpec, {
      widget: "core/v1/popover" as any,
      widgetOptions: { displayedKeys: ["label"] },
    }),
    {
      title: "Info",
      widget: "core/v1/record",
    }
  ),
});

const KubectlGetDetailProps = Type.Object({
  basePath: Type.String({
    title: "Base path",
    description: "K8s Api base path",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  watchWsBasePath: Type.String({
    title: "Watch websocket base path",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  apiBase: Type.String({
    title: "Api base",
    widget: "kui/v1/ApiBaseWidget",
    description: "K8s resource api base, e.g, /apis/apps/v1",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  namespace: Type.String({
    title: "Namespace",
    description: "namespace filter",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  resource: Type.String({
    title: "Resource",
    category: PRESET_PROPERTY_CATEGORY.Data,
    widget: "kui/v1/ResourceWidget",
    conditions: [
      {
        key: "apiBase",
        not: "",
      },
      {
        key: "apiBase",
        not: undefined,
      },
    ],
  }),
  name: Type.String({
    title: "Name",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  query: Type.Record(Type.String(), Type.Any(), {
    title: "Query",
    category: PRESET_PROPERTY_CATEGORY.Data,
  }),
  layout: Type.Object(
    {
      type: StringUnion(["simple", "tabs"], { title: "Type" }),
      tabs: Type.Array(
        Type.Object({
          key: Type.String({ title: "Key" }),
          label: Type.String({ title: "Label" }),
          sections: Type.Array(SectionSpec, {
            title: "Sections",
            widget: "core/v1/array",
            widgetOptions: { displayedKeys: ["title"] },
          }),
        }),
        {
          title: "Tabs",
          widget: "core/v1/array",
          widgetOptions: {
            displayedKeys: ["label"],
          },
          conditions: [
            {
              key: "type",
              value: "tabs",
            },
          ],
        }
      ),
      sections: Type.Array(SectionSpec, {
        title: "Sections",
        widget: "core/v1/array",
        widgetOptions: {
          displayedKeys: ["title"],
        },
        conditions: [
          {
            key: "type",
            value: "simple",
          },
        ],
      }),
    },
    {
      title: "Layout",
      category: PRESET_PROPERTY_CATEGORY.Layout,
      widget: "kui/v1/KubectlGetDetailLayoutWidget",
    }
  ),
  errorText: Type.String({
    title: "Error text",
    category: PRESET_PROPERTY_CATEGORY.Behavior,
  }),
});

const KubectlGetDetailState = Type.Object({
  data: Type.Any(),
  loading: Type.Boolean(),
  error: Type.String(),
  activeTab: Type.String(),
  deleting: Type.Boolean(),
});

export const KubectlGetDetail = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_get_detail",
    displayName: "Kubectl Get Detail",
    exampleProperties: {
      basePath: "/api/k8s",
      apiBase: "/apis/storage.k8s.io/v1",
      namespace: "",
      resource: "storageclasses",
      name: "",
      layout: {
        type: "tabs",
        tabs: [
          {
            label: "Detail",
            key: "detail",
            sections: [
              {
                title: "",
                info: {
                  metadata: [
                    {
                      label: "Name",
                      path: "metadata.name",
                      condition: true,
                    },
                    {
                      label: "Labels",
                      path: "metadata.labels",
                      condition: true,
                    },
                    {
                      label: "Age",
                      path: "metadata.creationTimestamp",
                      condition: true,
                    },
                  ],
                },
              },
            ],
          },
          {
            label: "Monitor",
            key: "monitor",
            sections: [],
          },
        ],
        sections: [],
      },
      query: {},
    },
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: KubectlGetDetailProps,
    state: KubectlGetDetailState,
    methods: {
      setActiveTab: Type.Object({ activeTab: Type.String() }),
      delete: Type.Object({
        options: Type.Object({
          sync: Type.Boolean(),
        }),
      }),
    },
    slots: {
      tab: {
        slotProps: Type.Object({
          tab: Type.String(),
          tabIndex: Type.Number(),
          detail: Type.Any(),
        }),
      },
      section: {
        slotProps: Type.Object({
          section: Type.String(),
          tab: Type.Optional(Type.String()),
          tabIndex: Type.Optional(Type.Number()),
          detail: Type.Any(),
        }),
      },
      key: {
        slotProps: Type.Object({
          tab: Type.Optional(Type.String()),
          tabIndex: Type.Optional(Type.Number()),
          section: Type.String(),
          category: Type.String(),
          path: Type.String(),
          label: Type.String(),
          value: Type.String(),
          detail: Type.Any(),
        }),
      },
      value: {
        slotProps: Type.Object({
          tab: Type.Optional(Type.String()),
          tabIndex: Type.Optional(Type.Number()),
          section: Type.String(),
          category: Type.String(),
          path: Type.String(),
          label: Type.String(),
          value: Type.String(),
          detail: Type.Any(),
        }),
      },
      action: {
        slotProps: Type.Object({
          tab: Type.Optional(Type.String()),
          tabIndex: Type.Optional(Type.Number()),
          section: Type.String(),
          category: Type.String(),
          path: Type.String(),
          label: Type.String(),
          value: Type.String(),
          detail: Type.Any(),
        }),
      },
    },
    styleSlots: ["content"],
    events: ["onItemDeleted", "onDeleteSuccess", "onDeleteFail"],
  },
})(
  ({
    elementRef,
    basePath,
    watchWsBasePath,
    apiBase,
    namespace,
    resource,
    name,
    layout,
    errorText,
    query,
    mergeState,
    customStyle,
    slotsElements,
    subscribeMethods,
    callbackMap,
  }) => {
    const [activeTab, setActiveTab] = useState<string>(
      layout.tabs?.[0]?.key || ""
    );
    const [data, setData] = useState<Unstructured | null>(null);
    const kubeSdk = useMemo(() => new KubeSdk({ basePath }), [basePath]);

    const onResponse = useCallback(
      (res) => {
        setData(res.data);
        mergeState({
          data: res.data,
          loading: res.loading,
          error: res.error ? String(res.error) : "",
        });

        if (res.data === undefined && !res.loading && !res.error) {
          callbackMap?.onItemDeleted?.();
        }
      },
      [mergeState, callbackMap]
    );
    const onTabChange = useCallback(
      (key: string) => {
        mergeState({
          activeTab: key,
        });
      },
      [mergeState]
    );

    useEffect(() => {
      subscribeMethods({
        setActiveTab: ({ activeTab: newActiveTab }) => {
          setActiveTab(newActiveTab);
        },
        async delete() {
          if (data) {
            try {
              mergeState({ deleting: true });
              await kubeSdk.deleteYaml([data]);
              callbackMap?.onDeleteSuccess?.();
            } catch {
              callbackMap?.onDeleteFail?.();
            } finally {
              mergeState({ deleting: false });
            }
          }
        },
      });
    }, [
      subscribeMethods,
      setActiveTab,
      mergeState,
      callbackMap,
      kubeSdk,
      data,
    ]);

    return (
      <BaseKubectlGetDetail
        ref={elementRef}
        className={ecss(customStyle?.content)}
        basePath={basePath}
        watchWsBasePath={watchWsBasePath}
        apiBase={apiBase}
        namespace={namespace}
        resource={resource}
        name={name}
        query={query}
        layout={layout}
        renderTab={(params, data, fallback) => {
          return slotsElements.tab?.(
            { ...params, ...data },
            fallback,
            `tab_${params.tab}_${params.tabIndex}`
          );
        }}
        renderSection={(params, data, fallback) => {
          return slotsElements.section?.(
            { ...params, ...data },
            fallback,
            `section_${params.section}`
          );
        }}
        renderKey={(params, data) => {
          return slotsElements.key?.(
            { ...params, ...data },
            null,
            `key_${params.path}_${params.label}`
          );
        }}
        renderValue={(params, data) => {
          return renderWidget(
            params,
            data,
            slotsElements.value,
            `value_${params.path}_${params.label}`
          );
        }}
        renderAction={(params, data) => {
          return slotsElements.action?.(
            { ...params, ...data },
            null,
            `action_${params.path}_${params.label}`
          );
        }}
        errorText={errorText}
        onResponse={onResponse}
        onTabChange={onTabChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }
);
