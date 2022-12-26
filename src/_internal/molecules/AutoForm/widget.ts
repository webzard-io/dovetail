import { JSONSchema7 } from "json-schema";
import type { Field, Services } from "../../organisms/KubectlApplyForm/type";

type WidgetOptions = Partial<{
  displayLabel: boolean;
  section?: string;
  step?: number;
}>;

export type WidgetProps<Value = any, WidgetOptions = Record<string, any>> = {
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
  displayValues: Record<string, any>;
  onChange: (
    newValue: Value,
    displayValues: Record<string, any>,
    key?: string,
    dataPath?: string
  ) => void;
  onDisplayValuesChange: (displayValues: Record<string, any>) => void;
  slot?: Function;
  helperSlot?: Function;
  fieldsArray: Record<string, { spec: JSONSchema7 }>[];
};
