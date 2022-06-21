import { JSONSchema7 } from "json-schema";

type WidgetOptions = Partial<{
  displayLabel: boolean;
  section: string;
}>;

export type WidgetProps = {
  spec: JSONSchema7 & {
    widgetOptions?: WidgetOptions;
  };
  level: number;
  path: string;
  value: any;
  onChange: (newV: any) => void;
  renderer?: (
    path: string,
    level: number,
    position: "before" | "after" | "widget"
  ) => React.ReactNode;
};