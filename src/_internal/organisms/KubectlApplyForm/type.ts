import { Emitter } from "mitt";

export type Field = {
  type?: "field" | "layout";
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
  layoutWidget?: string;
  indent?: boolean;
  widgetOptions?: Record<string, any>;
  componentId?: string;
  col?: number;
  splitLine?: boolean;
  defaultValue?: any;
  summaryConfig?: {
    type?: "auto" | "item";
    label?: string;
    value?: string;
    icon?: string;
    hidden?: boolean;
  };
};

export type FormItemData = (Field | Record<string, unknown>) & { index?: number; };

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

export type Events = {
  remove: {
    index: number;
    fieldKey: string;
  };
};

export type Store = {
  summary: {
    removableMap: Record<string, boolean>;
  };
};

export type Services = {
  event: Emitter<Events>;
  store: Store;
  setStore: (store: Store) => void;
};
