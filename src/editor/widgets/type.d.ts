import { JSONSchema7 } from "json-schema";

declare module "@sunmao-ui/editor-sdk" {
  interface WidgetOptionsMap {
    "kui/v1/FieldCustomComponentWidget": {};
    "kui/v1/CustomComponentWidget": {
      keyOfPath?: string;
      slot?: string;
      isDisplayLabel: false;
    };
    "kui/v1/KubectlApplyFormDesignWidget": {};
    "kui/v1/PathWidget": {
      withIndex: boolean;
    };
    "kui/v1/ApiBaseWidget": {};
    "kui/v1/KindWidget": {};
    "kui/v1/ResourceWidget": {};
    "kui/v1/OptionsWidget": {
      optionsMap: Record<string, JSONSchema7>;
    };
    "kui/v1/KubectlGetDetailLayoutWidget": {};
  }
}

export {};
