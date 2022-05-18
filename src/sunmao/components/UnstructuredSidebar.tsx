import React, { useContext, useEffect, useState } from "react";
import {
  implementRuntimeComponent,
  DIALOG_CONTAINER_ID,
} from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { css } from "@emotion/css";
import { KitContext } from "../../themes/theme-context";
import _ObjectMeta from "../../_internal/components/_ObjectMeta";
import _ObjectSpec from "../../_internal/components/_ObjectSpec";
import _ObjectStatus from "../../_internal/components/_ObjectStatus";

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

const Header = css`
  display: flex;
  line-height: 22px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3a56;
  margin: 16px 0;
`;

const CardWrapper = css`
  border-radius: 4px;
  background-color: white;
  box-shadow: 0px 0.119595px 0.438513px rgba(129, 138, 153, 0.14),
    0px 0.271728px 0.996336px rgba(129, 138, 153, 0.106447),
    0px 0.472931px 1.73408px rgba(129, 138, 153, 0.0912224),
    0px 0.751293px 2.75474px rgba(129, 138, 153, 0.0799253),
    0px 1.15919px 4.25036px rgba(129, 138, 153, 0.07),
    0px 1.80882px 6.63236px rgba(129, 138, 153, 0.0600747),
    0px 3.00293px 11.0107px rgba(129, 138, 153, 0.0487776),
    0px 6px 22px rgba(129, 138, 153, 0.0335534);
  margin-bottom: 40px;

  .card-body {
    padding: 8px 16px;
  }
`;

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
        <div className={Header}>{item?.metadata.name}</div>
        <div className={CardWrapper}>
          <div className="card-body">
            <_ObjectMeta item={item} />
          </div>
        </div>
        <div className={Header}>Spec</div>
        <div className={CardWrapper}>
          <div className="card-body">
            <_ObjectSpec item={item} />
          </div>
        </div>
        <div className={Header}>Status</div>
        <div className={CardWrapper}>
          <div className="card-body">
            <_ObjectStatus item={item} />
          </div>
        </div>
      </kit.Sidebar>
    );
  }
);
