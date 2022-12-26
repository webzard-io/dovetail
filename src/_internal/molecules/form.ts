import Group, { OptionsSpec as GroupOptionsSpec } from "./Group";
import Input, { OptionsSpec as InputOptionsSpec } from "./Input";
import Select, { OptionsSpec as SelectOptionsSpec } from "./Select";
import Textarea, { OptionsSpec as TextareaOptionsSpec } from "./Textarea";
import InputNumber, {
  OptionsSpec as InputNumberOptionsSpec,
} from "./InputNumber";
import Switch, { OptionsSpec as SwitchOptionsSpec } from "./Switch";
import Card, { OptionsSpec as CardOptionsSpec } from "./Card";
import ArrayCards, { OptionsSpec as ArrayCardsOptionsSpec } from "./ArrayCards";
import K8sSelect, { OptionsSpec as K8sSelectOptionsSpec } from "./K8sSelect";

export const FORM_WIDGETS_MAP = {
  input: Input,
  select: Select,
  textarea: Textarea,
  number: InputNumber,
  switch: Switch,
  card: Card,
  arrayCards: ArrayCards,
  k8sSelect: K8sSelect,
  group: Group,
};
export const FORM_WIDGET_OPTIONS_MAP = {
  input: InputOptionsSpec,
  select: SelectOptionsSpec,
  textarea: TextareaOptionsSpec,
  number: InputNumberOptionsSpec,
  switch: SwitchOptionsSpec,
  card: CardOptionsSpec,
  arrayCards: ArrayCardsOptionsSpec,
  k8sSelect: K8sSelectOptionsSpec,
  group: GroupOptionsSpec,
};
