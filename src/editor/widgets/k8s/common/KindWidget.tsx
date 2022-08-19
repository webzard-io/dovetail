import { implementWidget, StringField } from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import K8sOpenAPI, { k8sOpenAPIMap } from "../remote-schema";
import { useState, useEffect, useMemo } from "react";
import { get } from "lodash";
import useProperty from "../../../hooks/useProperty";

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "KindWidget",
  },
})((props) => {
  const [kinds, setKinds] = useState<string[]>([]);
  const { component, path } = props;
  const basePath = useProperty({
    component,
    path,
    key: "basePath",
  });

  const api = useMemo(
    () => k8sOpenAPIMap[basePath] || new K8sOpenAPI({ basePath }),
    [basePath]
  );

  k8sOpenAPIMap[basePath] = api;

  useEffect(() => {
    (async function () {
      setKinds(await api.getKinds());
    })();
  }, []);

  return <StringField {...props} spec={StringUnion(kinds)}></StringField>;
});
