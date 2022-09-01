import React, { useCallback } from "react";
import { Type } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { StringUnion, PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import BaseKubectlGetDetail from "../../_internal/organisms/KubectlGetDetail/KubectlGetDetail";
import {
  DISPLAY_WIDGETS_MAP,
  DISPLAY_WIDGET_OPTIONS_MAP,
} from "../../_internal/molecules/display";
import { renderWidget } from "../utils/widget";

const InfoSpec = Type.Object(
  {
    label: Type.String({ title: "Label" }),
    path: Type.String({
      title: "Path",
      widget: "kui/v1/PathWidget",
    }),
    widget: StringUnion(
      ["default", "component"].concat(Object.keys(DISPLAY_WIDGETS_MAP)),
      {
        title: "Widget",
      }
    ),
    widgetOptions: Type.Record(Type.String(), Type.Any(), {
      title: "Widget options",
      widget: "kui/v1/OptionsWidget",
      widgetOptions: {
        optionsMap: DISPLAY_WIDGET_OPTIONS_MAP,
      },
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
  info: Type.Record(
    Type.String(),
    Type.Array(InfoSpec, {
      widget: "core/v1/popover",
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
  fieldSelector: Type.String({
    title: "Field selector",
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
});

const KubectlGetDetailState = Type.Object({
  data: Type.Any(),
  loading: Type.Boolean(),
  error: Type.String(),
  activeTab: Type.String(),
});

export const KubectlGetDetail = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_get_detail",
    displayName: "Kubectl Get Detail",
    exampleProperties: {
      basePath: "proxy-k8s",
      apiBase: "/apis/apps/v1",
      namespace: "kube-system",
      resource: "deployments",
      name: "coredns",
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
                    },
                    {
                      label: "Labels",
                      path: "metadata.labels",
                    },
                    {
                      label: "Age",
                      path: "metadata.creationTimestamp",
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
    },
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: KubectlGetDetailProps,
    state: KubectlGetDetailState,
    methods: {},
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
    events: [],
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
    mergeState,
    customStyle,
    slotsElements,
  }) => {
    const onResponse = useCallback(
      (res) => {
        mergeState({
          data: res.data,
          loading: res.loading,
          error: res.error ? String(res.error) : "",
        });
      },
      [mergeState]
    );
    const onTabChange = useCallback(
      (key: string) => {
        mergeState({
          activeTab: key,
        });
      },
      [mergeState]
    );

    return (
      <BaseKubectlGetDetail
        ref={elementRef}
        basePath={basePath}
        watchWsBasePath={watchWsBasePath}
        apiBase={apiBase}
        namespace={namespace}
        resource={resource}
        name={name}
        layout={layout}
        renderTab={(params, data, fallback) => {
          return slotsElements.tab?.({ ...params, ...data }, fallback);
        }}
        renderSection={(params, data, fallback) => {
          return slotsElements.section?.({ ...params, ...data }, fallback);
        }}
        renderKey={(params, data) => {
          return slotsElements.key?.({ ...params, ...data });
        }}
        renderValue={(params, data) => {
          return renderWidget(params, data, slotsElements.value);
        }}
        renderAction={(params, data) => {
          return slotsElements.action?.({ ...params, ...data });
        }}
        onResponse={onResponse}
        onTabChange={onTabChange}
      />
    );
  }
);
