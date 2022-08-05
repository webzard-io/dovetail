import { implementWidget, SpecWidget } from "@sunmao-ui/editor-sdk";
import { Type, Static } from "@sinclair/typebox";
import { get } from "lodash";

const OptionsSpec = Type.Object({
  optionsMap: Type.Record(Type.String(), Type.Any()),
});

export default implementWidget<"kui/v1/OptionsWidget">({
  version: "kui/v1",
  metadata: {
    name: "OptionsWidget",
  },
  spec: {
    options: OptionsSpec,
  },
})((props) => {
  const { spec, component, path } = props;
  const optionsMap = spec.widgetOptions?.optionsMap || {};
  const widget = get(
    component.properties,
    path.slice(0, -1).concat(["widget"]).join(".")
  );
  const optionsSpec =
    optionsMap[widget as keyof typeof optionsMap] || Type.Any();

  return <SpecWidget {...props} spec={optionsSpec}></SpecWidget>;
});
