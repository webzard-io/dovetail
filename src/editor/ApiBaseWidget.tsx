import { implementWidget, StringField } from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import { getApiBases } from "./remote-schema";
import { useState, useEffect } from "react";

export default implementWidget<"kui/v1/ApiBaseWidget">({
  version: "kui/v1",
  metadata: {
    name: "ApiBaseWidget",
  },
})((props) => {
  const [apiBases, setApiBases] = useState<string[]>([]);

  useEffect(() => {
    (async function () {
      setApiBases(await getApiBases());
    })();
  }, []);

  return <StringField {...props} spec={StringUnion(apiBases)}></StringField>;
});
