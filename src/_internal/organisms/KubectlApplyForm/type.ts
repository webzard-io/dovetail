export type Field = {
  fields?: Field[];
  path: string;
  key?: string;
  label: string;
  layout: "horizontal" | "vertical";
  isDisplayLabel: boolean;
  labelWidth?: number;
  helperText: string;
  sectionTitle: string;
  error: string | string[] | Record<string, string>;
  condition?: boolean;
  widget?: string;
  widgetOptions?: Record<string, any>;
  componentId?: string;
  col?: number;
  splitLine?: boolean;
  defaultValue?: any;
};

export type TransformedField = Field & { dataPath: string; value: any };

export type Layout =
  | {
      type: "simple";
      fields: Field[];
    }
  | {
      type: "tabs";
      tabs: {
        title: string;
        fields: Field[];
      }[];
    }
  | {
      type: "wizard";
      steps: {
        title: string;
        fields: Field[];
        disabled?: boolean;
        prevText?: string;
        nextText?: string;
      }[];
    };
