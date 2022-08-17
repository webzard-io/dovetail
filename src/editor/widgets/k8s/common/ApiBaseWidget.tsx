import { implementWidget, StringField } from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import K8sOpenAPI, { k8sOpenAPIMap } from "../remote-schema";
import { useState, useEffect, useMemo } from "react";
import { get } from "lodash";

export default implementWidget<"kui/v1/ApiBaseWidget">({
  version: "kui/v1",
  metadata: {
    name: "ApiBaseWidget",
  },
})((props) => {
  const { component, path } = props;
  const [apiBases, setApiBases] = useState<string[]>([]);
  const basePath = useMemo(
    () =>
      (get(
        component.properties,
        path.slice(0, -1).concat(["basePath"]).join(".")
      ) || "") as string,
    [component.properties, path]
  );

  const api = useMemo(
    () => k8sOpenAPIMap[basePath] || new K8sOpenAPI({ basePath }),
    [basePath]
  );

  k8sOpenAPIMap[basePath] = api;

  useEffect(() => {
    (async function () {
      setApiBases(await api.getApiBases());
    })();
  }, [api]);

  return <StringField {...props} spec={StringUnion(apiBases)}></StringField>;
});
