import React, { useEffect } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { UIKitProvider } from "@cloudtower/eagle";

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
    slots: {
      root: {
        slotProps: Type.Object({}),
      },
    },
    styleSlots: [],
    events: [],
  },
})(({ slotsElements, mergeState }) => {
  useEffect(() => {
    mergeState({
      theme: "CloudTower",
    });
  }, []);

  return (
    <UIKitProvider>
      <I18nextProvider i18n={i18n}>
        <>{slotsElements.root ? slotsElements.root?.({}) : null}</>
      </I18nextProvider>
    </UIKitProvider>
  );
});
