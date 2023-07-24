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
import K8sLabelGroup, {
  OptionsSpec as K8sLabelGroupOptionsSpec,
} from "./K8sLabelGroup";
import Editor, {
  OptionsSpec as EditorOptionSpec
} from "./Editor";

export const FORM_WIDGETS_MAP = {
  input: Input,
  select: Select,
  textarea: Textarea,
  number: InputNumber,
  switch: Switch,
  k8sSelect: K8sSelect,
  k8sLabelGroup: K8sLabelGroup,
  card: Card,
  arrayCards: ArrayCards,
  group: Group,
  editor: Editor,
};
export const FORM_WIDGET_OPTIONS_MAP = {
  input: InputOptionsSpec,
  select: SelectOptionsSpec,
  textarea: TextareaOptionsSpec,
  number: InputNumberOptionsSpec,
  switch: SwitchOptionsSpec,
  k8sSelect: K8sSelectOptionsSpec,
  k8sLabelGroup: K8sLabelGroupOptionsSpec,
  card: CardOptionsSpec,
  arrayCards: ArrayCardsOptionsSpec,
  group: GroupOptionsSpec,
  editor: EditorOptionSpec,
};
