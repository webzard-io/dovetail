import './type.d';
import { ImplementedWidget } from "@sunmao-ui/editor-sdk";
import AutoFormSpecWidget from "./AutoFormSpecWidget";
import KubectlApplyFormDesignWidget from "./KubectlApplyFormDesignWidget";
import ConstWidget from "./ConstWidget";
import KubectlApplyFormPathWidget from "./KubectlApplyFormPathWidget";
import FieldCustomComponentWidget from './FieldCustomComponentWidget';

export const widgets: ImplementedWidget<any>[] = [
  AutoFormSpecWidget,
  KubectlApplyFormDesignWidget,
  ConstWidget,
  KubectlApplyFormPathWidget,
  FieldCustomComponentWidget
];
