import { JSONSchema7 } from "json-schema";
import type { Field, Services, FormItemData } from "../../organisms/KubectlApplyForm/type";

type WidgetOptions = Partial<{
  displayLabel: boolean;
  section?: string;
  step?: number;
}>;

type SlotFunction = (
  props: FormItemData,
  fallback: React.ReactNode,
  key: string
) => React.ReactNode;

export type WidgetProps<
  Value = any,
  WidgetOptions = Record<string, unknown>
> = {
  services: Services;
  basePath: string;
  field?: Field;
  item?: Field["subItem"]
  itemKey: string;
  spec: JSONSchema7;
  widget?: string;
  widgetOptions?: WidgetOptions;
  level: number;
  path: string;
  superiorKey?: string;
  index?: number;
  error?: string | string[] | Record<string, string>;
  value: Value;
  displayValues: Record<string, unknown>;
  enabledEditorMap: Record<string, boolean>;
  setEnabledEditorMap: (newMap: Record<string, boolean>)=> void;
  onChange: (
    newValue: Value,
    displayValues: Record<string, unknown>,
    key?: string,
    dataPath?: string
  ) => void;
  onDisplayValuesChange: (displayValues: Record<string, unknown>) => void;
  slot?: SlotFunction;
  helperSlot?: SlotFunction;
  labelSlot?: SlotFunction;
  setWidgetErrors: (errors: string[])=> void;
  specsArray: Record<string, { spec: JSONSchema7 }>[];
};
