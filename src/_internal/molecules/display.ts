import ObjectAge from "./ObjectAge";
import ObjectLabel, { OptionsSpec as LabelOptionsSpec } from "./ObjectLabel";

export const DISPLAY_WIDGETS_MAP = {
  time: ObjectAge,
  label: ObjectLabel,
};
export const DISPLAY_WIDGET_OPTIONS_MAP = {
  label: LabelOptionsSpec,
};
