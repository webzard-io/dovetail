import {
  implementWidget,
  ObjectField,
} from "@sunmao-ui/editor-sdk";
import React, { useCallback } from "react";

export default implementWidget<"kui/v1/KubectlGetDetailLayoutWidget">({
  version: "kui/v1",
  metadata: {
    name: "KubectlGetDetailLayoutWidget",
  },
})(function KubectlGetDetailLayoutWidget(props) {
  const onChange = useCallback(
    (layout) => {
      const oldLayout = props.value;
      let result = layout;

      if (layout.type !== oldLayout.type) {
        let sections = [];

        switch (oldLayout.type) {
          case "simple": {
            sections = oldLayout.sections;
            break;
          }
          case "tabs": {
            sections = oldLayout.tabs.map(({ sections }) => sections).flat();
            break;
          }
        }

        switch (layout.type) {
          case "simple": {
            result = {
              ...layout,
              tabs: [],
              sections,
            };
            break;
          }
          case "tabs": {
            result = {
              ...layout,
              sections: [],
              tabs: [
                {
                  key: "detail",
                  label: "Detail",
                  sections,
                },
              ],
            };
            break;
          }
        }
      }

      props.onChange(result);
    },
    [props.value, props.onChange]
  );

  return <ObjectField {...props} onChange={onChange}></ObjectField>;
});
