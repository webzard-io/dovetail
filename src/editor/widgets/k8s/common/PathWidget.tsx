import { useEffect, useRef, useState } from "react";
import {
  implementWidget,
  isExpression,
} from "@sunmao-ui/editor-sdk";
import { Select } from "chakra-react-select";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import store from "../store";
import { Type } from "@sinclair/typebox";

const PathWidgetOptionsSpec = Type.Object({
  withIndex: Type.Boolean(),
});

export default implementWidget<"kui/v1/PathWidget">({
  version: "kui/v1",
  metadata: {
    name: "PathWidget",
  },
  spec: {
    options: PathWidgetOptionsSpec,
  },
})(
  observer(function PathWidget(props) {
    const { value, services, spec, onChange } = props;
    const withIndex = spec.widgetOptions?.withIndex ?? true;
    const path = useRef<string>(
      isExpression(value) ? services.stateManager.maskedEval(value) : value
    );

    return (
      <Box>
        <Select
          value={{ label: path.current, value: path.current }}
          options={store.paths
            .map((paths, index) =>
              withIndex ? paths.map((pathStr) => `${index}.${pathStr}`) : paths
            )
            .flat()
            .map((pathStr) => ({
              label: pathStr,
              value: pathStr,
            }))}
          size="sm"
          onChange={(newValue) => {
            path.current = newValue?.value || "";
            onChange(path.current);
          }}
        />
      </Box>
    );
  })
);
