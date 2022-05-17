import React, { useContext, useEffect, useState } from "react";
import {
  implementRuntimeComponent,
  DIALOG_CONTAINER_ID,
} from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { KitContext } from "../../themes/theme-context";
import _ObjectMeta from "../../_internal/components/_ObjectMeta";
import { css } from "@emotion/css";

const UnstructuredSidebarProps = Type.Object({
  item: Type.Any(),
  defaultVisible: Type.Boolean(),
});

const UnstructuredTableState = Type.Object({
  visible: Type.Boolean(),
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
    state: UnstructuredTableState,
    methods: {
      setVisible: Type.Object({
        visible: Type.Boolean(),
      }),
    },
    slots: {},
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
  }) => {
    const kit = useContext(KitContext);
    const [visible, setVisible] = useState(defaultVisible);
    useEffect(() => {
      mergeState({
        visible,
      });
    }, [visible]);
    useEffect(() => {
      subscribeMethods({
        setVisible(params) {
          setVisible(params.visible);
        },
      });
    }, [subscribeMethods]);

    return (
      <kit.Sidebar
        visible={visible}
        onClose={() => {
          setVisible(false);
          callbackMap?.onClose();
        }}
        ref={elementRef}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        width={600}
      >
        <_ObjectMeta item={item} />
      </kit.Sidebar>
    );
  }
);
