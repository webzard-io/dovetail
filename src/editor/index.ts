import { ImplementedWidget } from "@sunmao-ui/editor-sdk";
import AutoFormSpecWidget from "./AutoFormSpecWidget";
import KubectlApplyFormDesignWidget from "./KubectlApplyFormDesignWidget";
import ConstWidget from "./ConstWidget";

export const widgets: ImplementedWidget<any>[] = [
  AutoFormSpecWidget,
  KubectlApplyFormDesignWidget,
  ConstWidget,
];
