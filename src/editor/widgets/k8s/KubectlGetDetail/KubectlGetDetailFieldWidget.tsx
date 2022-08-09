import {
  implementWidget,
  ObjectField,
} from "@sunmao-ui/editor-sdk";
import React, { useMemo } from "react";
import store from "../store";
import { mergeWidgetOptionsByPath } from "../../../utils/schema";
import { observer } from 'mobx-react-lite';

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "KubectlGetDetailFieldWidget",
  },
})(observer(function KubectlGetDetailFieldWidget(props) {
  const spec = useMemo(() => {
    let spec = props.spec;

    return mergeWidgetOptionsByPath(spec, "path", {
      paths: store.paths.flat(),
    });
  }, [props.spec, store.paths]);

  return <ObjectField {...props} spec={spec}></ObjectField>;
}));
