import {
  implementWidget,
  StringField,
} from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import { getKinds } from "./remote-schema";
import { useState, useEffect } from "react";

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "KindWidget",
  },
})((props) => {
  const [kinds, setKinds] = useState<string[]>([]);

  useEffect(() => {
    (async function () {
      setKinds(await getKinds());
    })();
  }, []);

  return <StringField {...props} spec={StringUnion(kinds)}></StringField>;
});
