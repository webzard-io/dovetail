import {
  implementWidget,
  CategoryWidget,
} from "@sunmao-ui/editor-sdk";
import React, { useMemo } from "react";
import store from "../store";
import { mergeWidgetOptionsByPath } from "../../../utils/schema";
import { observer } from "mobx-react-lite";

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "KubectlGetTableColumnWidget",
  },
})(observer(function KubectlGetTableColumnWidget(props) {
  const spec = useMemo(() => {
    const spec = props.spec;

    return mergeWidgetOptionsByPath(spec, "dataIndex", {
      paths: store.paths.flat(),
    });
  }, [props.spec]);

  return <CategoryWidget {...props} spec={spec}></CategoryWidget>;
}));
