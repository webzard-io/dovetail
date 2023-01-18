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
  spec: JSONSchema7;
  widget?: string;
  widgetOptions?: WidgetOptions;
  level: number;
  path: string;
  step?: number;
  layout?: {
    steps?: { paths: string[] }[];
  };
  stepElsRef: Record<number, HTMLElement | null>;
  subKey?: string;
  index?: number;
  error?: string | string[] | Record<string, string>;
  value: Value;
  displayValues: Record<string, unknown>;
  onChange: (
    newValue: Value,
    displayValues: Record<string, unknown>,
    key?: string,
    dataPath?: string
  ) => void;
  onDisplayValuesChange: (displayValues: Record<string, unknown>) => void;
  slot?: SlotFunction;
  helperSlot?: SlotFunction;
  fieldsArray: Record<string, { spec: JSONSchema7 }>[];
};
