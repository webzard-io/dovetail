import { Type } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import _KubectlGetDetail from "../../_internal/organisms/KubectlGetDetail/KubectlGetDetail";

const KubectlGetDetailProps = Type.Object({});

const KubectlGetDetailState = Type.Object({});

export const KubectlGetDetail = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_get_detail",
    displayName: "Kubectl Get Detail",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 4],
    exampleProperties: {},
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: KubectlGetDetailProps,
    state: KubectlGetDetailState,
    methods: {},
    slots: {},
    styleSlots: [],
    events: [],
  },
})(({ elementRef }) => {
  return (
    <_KubectlGetDetail
      ref={elementRef}
      k8sConfig={{
        basePath: "/proxy-k8s",
      }}
      objectConstructor={{
        kind: "Pod",
        apiBase: "/api/v1/pods",
        name: "grafana-7cd8ccfd88-g7z9l",
        // name: "elasticsearch-master-0",
        namespace: "default",
      }}
    />
  );
});
