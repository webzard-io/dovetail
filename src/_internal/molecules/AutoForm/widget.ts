import { JSONSchema7 } from "json-schema";
import type { Field } from "../../organisms/KubectlApplyForm/type";

type WidgetOptions = Partial<{
  displayLabel: boolean;
  section?: string;
  step?: number;
}>;

export type WidgetProps<Value = any, WidgetOptions = Record<string, any>> = {
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
  error?: string;
  value: Value;
  onChange: (newValue: Value, key?: string) => void;
  slot?: Function;
};
