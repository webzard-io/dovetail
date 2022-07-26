import './type.d';
import { ImplementedWidget } from "@sunmao-ui/editor-sdk";
import AutoFormSpecWidget from "./AutoFormSpecWidget";
import KubectlApplyFormDesignWidget from "./KubectlApplyFormDesignWidget";
import ConstWidget from "./ConstWidget";
import PathWidget from "./PathWidget";
import FieldCustomComponentWidget from './FieldCustomComponentWidget';
import CustomComponentWidget from './CustomComponentWidget';
import KindWidget from './KindWidget';
import ApiBaseWidget from './ApiBaseWidget';
import ResourceWidget from './ResourceWidget';
import OptionsWidget from './OptionsWidget';

export const widgets: ImplementedWidget<any>[] = [
  AutoFormSpecWidget,
  KubectlApplyFormDesignWidget,
  ConstWidget,
  PathWidget,
  FieldCustomComponentWidget,
  CustomComponentWidget,
  KindWidget,
  ApiBaseWidget,
  ResourceWidget,
  OptionsWidget
];
