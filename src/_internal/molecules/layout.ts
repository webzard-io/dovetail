import Group, { OptionsSpec as GroupOptionsSpec } from "./Group";
import Card, { OptionsSpec as CardOptionsSpec } from "./Card";
import DefaultLayout, {
  OptionsSpec as DefaultLayoutOptionsSpec,
} from "./DefaultLayout";

export const LAYOUT_WIDGETS_MAP = {
  default: DefaultLayout,
  card: Card,
  group: Group,
};
export const LAYOUT_WIDGET_OPTIONS_MAP = {
  card: CardOptionsSpec,
  group: GroupOptionsSpec,
  default: DefaultLayoutOptionsSpec,
};
