import ObjectAge from "./Display/ObjectAge";
import ObjectLabel, { OptionsSpec as LabelOptionsSpec } from "./Display/ObjectLabel";

export const DISPLAY_WIDGETS_MAP = {
  time: ObjectAge,
  label: ObjectLabel,
};
export const DISPLAY_WIDGET_OPTIONS_MAP = {
  label: LabelOptionsSpec,
};
