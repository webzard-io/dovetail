import React, { useCallback } from "react";
import BaseK8sLabelGroup from "../components/K8sLabelGroup";
import type { Label } from "../components/LabelGroup";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({});

type Props = WidgetProps<Record<string, string>, Static<typeof OptionsSpec>>;

const K8sLabelGroup = (props: Props) => {
  const { value, displayValues } = props;
  const onChange = useCallback(
    (newLabelsArray: Label[]) => {
      const newLabels = newLabelsArray.reduce(
        (result: Record<string, string>, label) => {
          result[label.key] = label.value || "";

          return result;
        },
        {}
      );

      props.onChange(
        newLabels,
        displayValues,
        `${
          props.subKey ? `${props.subKey}${props.field?.key ? "-" : ""}` : ""
        }${props.field?.key || ""}`,
        props.path
      );
    },
    [props, displayValues]
  );

  return (
    <BaseK8sLabelGroup
      labels={Object.entries(value || {}).map(([key, value]) => ({
        key,
        value,
      }))}
      editable={true}
      onChange={onChange}
    ></BaseK8sLabelGroup>
  );
};

export default K8sLabelGroup;
