import { implementWidget, StringField } from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import K8sOpenAPI, { k8sOpenAPIMap } from "../remote-schema";
import { useState, useEffect } from "react";
import { get } from "lodash";

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "KindWidget",
  },
})((props) => {
  const [kinds, setKinds] = useState<string[]>([]);
  const { component, path } = props;
  const basePath = (get(
    component.properties,
    path.slice(0, -1).concat(["basePath"]).join(".")
  ) || "") as string;

  const api = k8sOpenAPIMap[basePath] || new K8sOpenAPI({ basePath });

  k8sOpenAPIMap[basePath] = api;

  useEffect(() => {
    (async function () {
      setKinds(await api.getKinds());
    })();
  }, []);

  return <StringField {...props} spec={StringUnion(kinds)}></StringField>;
});
