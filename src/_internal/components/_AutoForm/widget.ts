import { JSONSchema7 } from "json-schema";

type WidgetOptions = Partial<{
  displayLabel: boolean;
}>;

export type WidgetProps = {
  spec: JSONSchema7 & {
    widgetOptions?: WidgetOptions;
  };
  level: number;
  path: string;
  value: any;
  onChange: (newV: any) => void;
};
