import { Input } from "@chakra-ui/react";
import { WidgetProps, implementWidget } from "@sunmao-ui/editor-sdk";

const ConstWidget: React.FC<WidgetProps> = (props) => {
  return <Input value={props.value} readOnly size="sm" />;
};

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "ConstWidget",
  },
})(ConstWidget);
