import { Select as AntdSelect } from "antd";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  KubeApi,
  UnstructuredList,
} from "../../_internal/k8s-api-client/kube-api";
import { compact, get } from "lodash";

export const OptionsSpec = Type.Object({
  basePath: Type.String({
    title: "Base path",
    description: "K8s Api base path",
  }),
  watchWsBasePath: Type.String({
    title: "Watch websocket base path",
  }),
  apiBase: Type.String({
    title: "Api base",
    description: "K8s resource api base, e.g, /apis/apps/v1",
  }),
  namespace: Type.String({
    title: "Namespace",
    description: "namespace filter",
  }),
  resource: Type.String({
    title: "Resource",
  }),
  fieldSelector: Type.String({
    title: "Field selector",
  }),
  valuePath: Type.String({
    title: "Value path",
  }),
  disabled: Type.Optional(Type.Boolean()),
});

type Props = WidgetProps<string | string[], Static<typeof OptionsSpec>>;

const K8sSelect = (props: Props) => {
  const kit = useContext(KitContext);
  const { value, displayValues, path, onChange, widgetOptions } = props;
  const {
    basePath,
    watchWsBasePath,
    apiBase,
    resource,
    namespace,
    fieldSelector,
    valuePath,
    disabled,
  } = widgetOptions || { options: [] };
  const [options, setOptions] = useState<{ label?: string; value?: string }[]>(
    []
  );

  const api = useMemo(
    () =>
      new KubeApi<UnstructuredList>({
        basePath: basePath || "",
        watchWsBasePath,
        objectConstructor: {
          kind: "",
          apiBase: `${apiBase}/${resource}`,
          namespace: namespace || "",
        },
      }),
    [basePath, watchWsBasePath, apiBase, resource, namespace]
  );

  useEffect(() => {
    (async function () {
      const result = await api.list({
        query: {
          namespace: namespace || "",
          fieldSelector: compact([fieldSelector]).join(","),
        },
      });

      setOptions(
        (result?.items || []).map((item) => ({
          label: get(item, valuePath || ""),
          value: get(item, valuePath || ""),
        }))
      );
    })().catch(() => {});
  }, [api, fieldSelector, namespace, valuePath]);

  return (
    <kit.Select
      disabled={disabled}
      value={(value || "") as any}
      onChange={(value, option) =>
        onChange(
          value,
          {
            ...displayValues,
            [path]: option.label,
          },
          `${
            props.subKey ? `${props.subKey}${props.field?.key ? "-" : ""}` : ""
          }${props.field?.key || ""}`,
          props.path
        )
      }
      showSearch
      optionFilterProp="children"
    >
      {options.map((option, idx) => {
        return (
          <AntdSelect.Option
            key={idx}
            value={option.value || ""}
            label={option.value || ""}
          >
            {option.label}
          </AntdSelect.Option>
        );
      })}
    </kit.Select>
  );
};

export default K8sSelect;
