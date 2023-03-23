import { DISPLAY_WIDGETS_MAP } from "../../_internal/molecules/display";
import ObjectAge from "../../_internal/molecules/ObjectAge";
import ObjectLabel from "../../_internal/molecules/ObjectLabel";
import React from "react";

export type Field = {
  path: string;
  transform?: (
    field: Omit<Field, "transform" | "widget" | "widgetOptions">,
    data: any
  ) => any;
  widget?: string;
  widgetOptions?: Record<string, any>;
  [props: string]: any;
};

export function renderWidget(
  field: Field,
  data: { value: any; renderedValue?: any; [props: string]: any },
  slot?: (
    props: any,
    fallback?: React.ReactNode,
    key?: string | undefined
  ) => React.ReactNode,
  slotKey?: string
) {
  const { value, record, renderedValue } = data;
  const { widget, widgetOptions = {}, transform, ...restField } = field;
  const transformedValue = transform
    ? transform(restField, data)
    : renderedValue ?? value;
  let node = transformedValue;

  if (widget && widget !== "default") {
    // use the widget
    const WidgetComponent =
      DISPLAY_WIDGETS_MAP[widget as keyof typeof DISPLAY_WIDGETS_MAP];

    node = WidgetComponent ? (
      <WidgetComponent {...widgetOptions} value={transformedValue} />
    ) : (
      transformedValue
    );
  } else {
    // apply the widget by path
    if (field.path === "metadata.creationTimestamp") {
      node = <ObjectAge value={transformedValue} />;
    } else if (
      field.path === "metadata.labels" ||
      field.path === "metadata.annotations"
    ) {
      node = (
        <ObjectLabel
          value={Object.entries(transformedValue || {}).map(
            ([key, value]) => `${key}: ${value}`
          )}
        />
      );
    }
  }

  return slot?.({ ...data, ...restField }, node, slotKey) || node;
}
