import React, { useContext, useEffect, useState } from "react";
import compact from "lodash/compact";
import {
  KubeApi,
  Unstructured,
  UnstructuredList,
} from "../../k8s-api-client/kube-api";
import { KitContext } from "../../atoms/kit-context";

type KubectlGetDetailProps = {
  k8sConfig: {
    basePath: string;
  };
  objectConstructor: {
    kind: string;
    apiBase: string;
    name: string;
    namespace?: string;
  };
};

const KubectlGetDetail = React.forwardRef<
  HTMLDivElement,
  KubectlGetDetailProps
>(({ k8sConfig, objectConstructor }, ref) => {
  const kit = useContext(KitContext);
  const [response, setResponse] = useState<{
    data: Unstructured | null;
    loading: boolean;
    error: null | Error;
  }>({
    data: null,
    loading: false,
    error: null,
  });
  const { data, loading, error } = response;

  useEffect(() => {
    const api = new KubeApi<UnstructuredList>({
      basePath: k8sConfig.basePath,
      objectConstructor,
    });

    setResponse((prev) => ({ ...prev, loading: true }));
    const stopP = api
      .listWatch({
        query: {
          fieldSelector: compact([
            `metadata.name=${objectConstructor.name}`,
            objectConstructor.namespace &&
              `metadata.namespace=${objectConstructor.namespace}`,
          ]),
        },
        cb: (res) => {
          setResponse(() => ({
            loading: false,
            error: null,
            data: res.items[0],
          }));
        },
      })
      .catch((err) => {
        setResponse(() => ({ loading: false, error: err, data: null }));
      });

    return () => {
      stopP.then((stop) => stop?.());
    };
  }, []);

  return (
    <div ref={ref}>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
});

export default KubectlGetDetail;
