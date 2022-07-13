import { JSONSchema7 } from "json-schema";

type WidgetOptions = Partial<{
  displayLabel: boolean;
  section?: string;
  step?: number;
}>;

export type WidgetProps = {
  spec: JSONSchema7 & {
    widgetOptions?: WidgetOptions;
  };
  widget?: string;
  level: number;
  path: string;
  step?: number;
  layout?: {
    steps?: { paths: string[] }[];
  };
  stepElsRef: Record<number, HTMLElement | null>;
  value: any;
  onChange: (newV: any) => void;
  renderer?: (
    path: string,
    level: number,
    position: "before" | "after" | "widget"
  ) => React.ReactNode;
};
