import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import { css } from "@emotion/css";
import { KitContext } from "../../_internal/atoms/kit-context";
import React, {
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { KubeApi } from "../../_internal/k8s-api-client/kube-api";

export const K8sNamespaceSelect = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "k8s_namespace_select",
    displayName: "K8sNamespaceSelect",
    description: "",
    isDraggable: false,
    isResizable: false,
    exampleProperties: {
      placeholder: "Please select"
    },
    exampleSize: [1, 1],
    annotations: {
      category: PRESET_PROPERTY_CATEGORY.Basic,
    },
  },
  spec: {
    properties: Type.Object({
      basePath: Type.String({ title: "Base path" }),
      watchWsBasePath: Type.String({ title: "Base path of websocket for watching" }),
      placeholder: Type.String({ title: "Placeholder" }),
    }),
    state: Type.Object({
      value: Type.String(),
    }),
    methods: {},
    slots: {},
    styleSlots: ["content"],
    events: [],
  },
})(({ basePath, watchWsBasePath, placeholder, customStyle, mergeState }) => {
  const kit = useContext(KitContext);
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const api = useMemo(
    () =>
      new KubeApi({
        basePath,
        watchWsBasePath,
        objectConstructor: {
          resourceBasePath: "/api/v1",
          resource: "namespaces",
        },
      }),
    [basePath, watchWsBasePath]
  );

  const onChange = useCallback(
    (value) => {
      mergeState({
        value,
      });
    },
    [mergeState]
  );

  useEffect(() => {
    api.listWatch({
      onResponse(value) {
        setOptions(
          value.items.map((namespace) => ({
            label: namespace.metadata.name || "",
            value: namespace.metadata.name || "",
          }))
        );
      },
    });
  }, [api]);

  return (
    <kit.Select
      options={options}
      placeholder={placeholder}
      className={css(customStyle?.content)}
      onChange={onChange}
      showSearch
    />
  );
});
