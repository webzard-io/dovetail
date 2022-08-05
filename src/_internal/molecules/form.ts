import Input, { OptionsSpec as InputOptionsSpec } from "./Form/Input";
import Select, { OptionsSpec as SelectOptionsSpec } from "./Form/Select";
import Textarea, { OptionsSpec as TextareaOptionsSpec } from "./Form/Textarea";
import InputNumber, {
  OptionsSpec as InputNumberOptionsSpec,
} from "./Form/InputNumber";
import Switch, { OptionsSpec as SwitchOptionsSpec } from "./Form/Switch";

export const FORM_WIDGETS_MAP = {
  input: Input,
  select: Select,
  textarea: Textarea,
  number: InputNumber,
  switch: Switch,
};
export const FORM_WIDGET_OPTIONS_MAP = {
  input: InputOptionsSpec,
  select: SelectOptionsSpec,
  textarea: TextareaOptionsSpec,
  number: InputNumberOptionsSpec,
  switch: SwitchOptionsSpec,
};
