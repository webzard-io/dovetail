import React, { useCallback, useEffect } from "react";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { ConfigProvider } from "antd";
import { I18nextProvider } from "react-i18next";
import { KitContext, CloudTowerKit } from "../../_internal/atoms/kit-context";
import i18n from "../../i18n";

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
    properties: Type.Object({
      popupContainerId: Type.String(),
    }),
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
})(({ popupContainerId, slotsElements, mergeState }) => {
  useEffect(() => {
    mergeState({
      theme: CloudTowerKit.name,
    });
  }, []);
  const antdGetPopupContainer = useCallback(() => {
    return document.getElementById(popupContainerId) || document.body;
  }, [popupContainerId]);

  return (
    <ConfigProvider
      prefixCls="dovetail-ant"
      getPopupContainer={popupContainerId ? antdGetPopupContainer : undefined}
    >
      <KitContext.Provider value={CloudTowerKit}>
        <I18nextProvider i18n={i18n}>
          <>{slotsElements.root ? slotsElements.root?.({}) : null}</>
        </I18nextProvider>
      </KitContext.Provider>
    </ConfigProvider>
  );
});
