import { useEffect, useRef, useState } from "react";
import {
  implementWidget,
  WidgetProps,
  isExpression,
} from "@sunmao-ui/editor-sdk";
import { Select } from "chakra-react-select";
import { Box } from "@chakra-ui/react";

class MiniStore extends EventTarget {
  paths: string[] = [];
  public updatePaths(newPaths: string[]) {
    this.paths = newPaths;
    this.dispatchEvent(new CustomEvent("update-paths"));
  }
}

export const pathStore = new MiniStore();

const KubectlApplyFormPathWidget: React.FC<WidgetProps> = (props) => {
  const { value, services, onChange } = props;
  const path = useRef<string>(
    isExpression(value) ? services.stateManager.maskedEval(value) : value
  );
  const [paths, setPaths] = useState<string[]>(pathStore.paths);
  useEffect(() => {
    pathStore.addEventListener("update-paths", () => {
      setPaths(pathStore.paths);
    });
  }, []);

  return (
    <Box>
      <Select
        value={{ label: path.current, value: path.current }}
        options={paths.map((s) => ({ label: s, value: s }))}
        size="sm"
        onChange={(newValue) => {
          path.current = newValue?.value || "";
          onChange(path.current);
        }}
      />
    </Box>
  );
};

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "KubectlApplyFormPathWidget",
  },
})(KubectlApplyFormPathWidget);
