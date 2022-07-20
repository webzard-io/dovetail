import './type.d';
import { ImplementedWidget } from "@sunmao-ui/editor-sdk";
import AutoFormSpecWidget from "./AutoFormSpecWidget";
import KubectlApplyFormDesignWidget from "./KubectlApplyFormDesignWidget";
import ConstWidget from "./ConstWidget";
import KubectlApplyFormPathWidget from "./KubectlApplyFormPathWidget";
import FieldWidget from './FieldWidget';

export const widgets: ImplementedWidget<any>[] = [
  AutoFormSpecWidget,
  KubectlApplyFormDesignWidget,
  ConstWidget,
  KubectlApplyFormPathWidget,
  FieldWidget
];
