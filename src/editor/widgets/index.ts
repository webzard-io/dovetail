import "./type.d";
import { ImplementedWidget } from "@sunmao-ui/editor-sdk";
import ConstWidget from "./common/ConstWidget";
import PathWidget from "./k8s/common/PathWidget";
import FieldCustomComponentWidget from "./k8s/common/FieldCustomComponentWidget";
import CustomComponentWidget from "./k8s/common/CustomComponentWidget";
import KindWidget from "./k8s/common/KindWidget";
import ApiBaseWidget from "./k8s/common/ApiBaseWidget";
import ResourceWidget from "./k8s/common/ResourceWidget";
import OptionsWidget from "./k8s/common/OptionsWidget";
import AutoFormSpecWidget from "./k8s/common/AutoFormSpecWidget";
import KubectlApplyFormDesignWidget from "./k8s/KubectlApplyForm/KubectlApplyFormDesignWidget";
import KubectrlGetDetailLayoutWidget from "./k8s/KubectlGetDetail/KubectrlGetDetailLayoutWidget";

export const widgets: ImplementedWidget<any>[] = [
  AutoFormSpecWidget,
  ConstWidget,
  PathWidget,
  FieldCustomComponentWidget,
  CustomComponentWidget,
  KindWidget,
  ApiBaseWidget,
  ResourceWidget,
  OptionsWidget,
  KubectlApplyFormDesignWidget,
  KubectrlGetDetailLayoutWidget,
];
