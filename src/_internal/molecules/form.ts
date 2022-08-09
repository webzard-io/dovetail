import Input, { OptionsSpec as InputOptionsSpec } from "./Input";
import Select, { OptionsSpec as SelectOptionsSpec } from "./Select";
import Textarea, { OptionsSpec as TextareaOptionsSpec } from "./Textarea";
import InputNumber, {
  OptionsSpec as InputNumberOptionsSpec,
} from "./InputNumber";
import Switch, { OptionsSpec as SwitchOptionsSpec } from "./Switch";

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
