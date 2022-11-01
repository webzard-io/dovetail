import { JSONSchema7 } from "json-schema";
import type { Field } from "../../organisms/KubectlApplyForm/type";

type WidgetOptions = Partial<{
  displayLabel: boolean;
  section?: string;
  step?: number;
}>;

export type WidgetProps<Value = any, WidgetOptions = Record<string, any>> = {
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
  onChange: (newValue: Value, key?: string, dataPath?: string) => void;
  slot?: Function;
  helperSlot?: Function;
};
