import { useEffect } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { KitContext, CloudTowerKit } from "../../themes/theme-context";

const RootState = Type.Object({
  theme: Type.String(),
});

export const Root = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "root",
    displayName: "Root",
    description: "please make sure your kui app has the root component",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {},
    exampleSize: [12, 12],
    annotations: {
      category: "Advance",
    },
  },
  spec: {
    properties: Type.Object({}),
    state: RootState,
    methods: {},
    slots: ["root"],
    styleSlots: [],
    events: ["onClick"],
  },
})(({ slotsElements, mergeState }) => {
  useEffect(() => {
    mergeState({
      theme: CloudTowerKit.name,
    });
  }, []);

  return (
    <KitContext.Provider value={CloudTowerKit}>
      {slotsElements.root}
    </KitContext.Provider>
  );
});
