import React, { useCallback } from "react";
import BaseK8sLabelGroup from "../components/K8sLabelGroup";
import type { Label, ValidateError } from "../components/LabelGroup";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";

export const OptionsSpec = Type.Object({
  codeMap: Type.Record(Type.String(), Type.String()),
});

type Props = WidgetProps<Record<string, string>, Static<typeof OptionsSpec>>;

const K8sLabelGroup = (props: Props) => {
  const { value, displayValues, widgetOptions, setWidgetErrors } = props;
  const { codeMap } = widgetOptions || {};
  const onChange = useCallback(
    (newLabelsArray: Label[]) => {
      const newLabels = newLabelsArray.reduce(
        (result: Record<string, string>, label) => {
          result[label.key] = label.value || "";

          return result;
        },
        {}
      );

      props.onChange(newLabels, displayValues, props.itemKey, props.path);
    },
    [props, displayValues]
  );
  const onInputChange = useCallback(
    (_: string, errors: ValidateError[]) => {
      setWidgetErrors(
        errors.map<string>(({ code }) => codeMap?.[code] || code)
      );
    },
    [codeMap, setWidgetErrors]
  );
  const onSubmit = useCallback((_, errors: ValidateError[]) => {
    setWidgetErrors(
      errors.map<string>(({ code }) => codeMap?.[code] || code)
    );
  }, [setWidgetErrors, codeMap]);
  const onCancel = useCallback(() => {
    setWidgetErrors([]);
  }, [setWidgetErrors]);

  return (
    <BaseK8sLabelGroup
      labels={Object.entries(value || {}).map(([key, value]) => ({
        key,
        value,
      }))}
      editable={true}
      onChange={onChange}
      onEditedKeyChange={onInputChange}
      onEditedValueChange={onInputChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
    ></BaseK8sLabelGroup>
  );
};

export default K8sLabelGroup;
