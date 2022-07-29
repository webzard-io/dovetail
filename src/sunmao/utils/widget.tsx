import { DISPLAY_WIDGETS_MAP } from "../../_internal/molecules/display";
import ObjectAge from "../../_internal/molecules/ObjectAge";

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
  data: { value: any; [props: string]: any },
  slot?: Function
) {
  const { value, record } = data;
  const { widget, widgetOptions = {}, transform, ...restField } = field;
  const transformedValue = transform ? transform(restField, data) : value;
  let node = transformedValue;

  if (widget && widget !== "none") {
    // use the widget
    const WidgetComponent =
      DISPLAY_WIDGETS_MAP[widget as keyof typeof DISPLAY_WIDGETS_MAP];

    node = WidgetComponent ? (
      <WidgetComponent {...widgetOptions} value={transformedValue} />
    ) : (
      value
    );
  } else {
    // apply the widget by path
    if (field.path === "metadata.creationTimestamp") {
      node = <ObjectAge value={value} />;
    }
  }

  return slot?.({ ...data, ...restField }, node) || node;
}
