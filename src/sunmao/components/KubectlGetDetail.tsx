import { Type } from "@sinclair/typebox";
import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import _KubectlGetDetail from "../../_internal/organisms/KubectlGetDetail/KubectlGetDetail";

const KubectlGetDetailProps = Type.Object({
  k8sConfig: Type.Object({
    basePath: Type.String(),
  }),
  objectConstructor: Type.Object({
    kind: Type.String(),
    apiBase: Type.String(),
    name: Type.String(),
    namespace: Type.String(),
  }),
});

const KubectlGetDetailState = Type.Object({
  data: Type.Any(),
  loading: Type.Boolean(),
  error: Type.String(),
});

export const KubectlGetDetail = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "kubectl_get_detail",
    displayName: "Kubectl Get Detail",
    isDraggable: true,
    isResizable: true,
    exampleSize: [4, 4],
    exampleProperties: {
      k8sConfig: {
        basePath: "/proxy-k8s",
      },
      objectConstructor: {
        kind: "Deployment",
        apiBase: "/apis/apps/v1/deployments",
        namespace: "kube-system",
        name: "coredns",
      },
    },
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
})(({ elementRef, k8sConfig, objectConstructor, mergeState }) => {
  return (
    <_KubectlGetDetail
      ref={elementRef}
      k8sConfig={k8sConfig}
      objectConstructor={objectConstructor}
      onResponse={(res) => {
        mergeState({
          data: res.data,
          loading: res.loading,
          error: res.error ? String(res.error) : "",
        });
      }}
    />
  );
});
