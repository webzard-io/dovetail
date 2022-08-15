import { useEffect, useRef, useState } from "react";
import { implementWidget, isExpression } from "@sunmao-ui/editor-sdk";
import { Select } from "chakra-react-select";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { Type } from "@sinclair/typebox";
import { css } from "@emotion/css";

const SelectStyle = css`
  z-index: 3;
`;

const PathWidgetOptionsSpec = Type.Object({
  paths: Type.Array(Type.String()),
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
    const paths = spec.widgetOptions?.paths ?? [];
    const path = useRef<string>(
      isExpression(value) ? services.stateManager.deepEval(value) : value
    );

    return (
      <Box>
        <Select
          className={SelectStyle}
          value={{ label: path.current, value: path.current }}
          options={paths.map((pathStr) => ({
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
