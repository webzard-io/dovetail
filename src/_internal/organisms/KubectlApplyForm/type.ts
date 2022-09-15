export type Field = {
  fields?: Field[];
  path: string;
  key?: string;
  label: string;
  layout: "horizontal" | "vertical";
  isDisplayLabel: boolean;
  helperText: string;
  sectionTitle: string;
  error: string | string[];
  condition?: boolean;
  widget?: string;
  widgetOptions?: Record<string, any>;
  componentId?: string;
  col?: number;
  splitLine?: boolean;
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
