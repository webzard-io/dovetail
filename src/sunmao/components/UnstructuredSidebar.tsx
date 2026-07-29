import React, { useEffect, useState } from "react";
import {
  implementRuntimeComponent,
  DIALOG_CONTAINER_ID,
} from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { css } from "@linaria/core";
import _UnstructuredSidebar from "../../_internal/organisms/UnstructuredSidebar";

const UnstructuredSidebarProps = Type.Object({
  item: Type.Any(),
  defaultVisible: Type.Boolean(),
  popupContainerId: Type.String(),
});

const UnstructuredSidebarState = Type.Object({
  visible: Type.Boolean(),
  item: Type.Boolean(),
});

const exampleItem = {
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: "nginx-deployment",
    labels: {
      app: "nginx",
    },
  },
  spec: {
    replicas: 3,
    selector: {
      matchLabels: {
        app: "nginx",
      },
    },
    template: {
      metadata: {
        labels: {
          app: "nginx",
        },
      },
      spec: {
        containers: [
          {
            name: "nginx",
            image: "nginx:1.14.2",
            ports: [
              {
                containerPort: 80,
              },
            ],
          },
        ],
      },
    },
  },
};

export const UnstructuredSidebar = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "unstructured_sidebar",
    displayName: "Unstructured Sidebar",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 8],
    exampleProperties: {
      item: exampleItem,
      defaultVisible: true,
    },
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: UnstructuredSidebarProps,
    state: UnstructuredSidebarState,
    methods: {
      setVisible: Type.Object({
        visible: Type.Boolean(),
      }),
    },
    slots: {
      toolbar: {
        slotProps: Type.Object({}),
      },
    },
    styleSlots: [],
    events: ["onClose"],
  },
})(
  ({
    item,
    defaultVisible = false,
    elementRef,
    callbackMap,
    mergeState,
    subscribeMethods,
    slotsElements,
    popupContainerId,
  }) => {
    const [visible, setVisible] = useState(defaultVisible);
    useEffect(() => {
      mergeState({
        visible,
        item,
      });
    }, [visible, item]);
    useEffect(() => {
      subscribeMethods({
        setVisible(params) {
          setVisible(params.visible);
        },
      });
    }, [subscribeMethods]);

    return (
      <_UnstructuredSidebar
        ref={elementRef}
        item={item}
        visible={visible}
        onVisibleChange={setVisible}
        toolbar={
          <>{slotsElements.toolbar ? slotsElements.toolbar({}) : null}</>
        }
        onClose={() => {
          callbackMap?.onClose();
        }}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) ||
          document.getElementById(popupContainerId) ||
          document.body
        }
      />
    );
  }
);
