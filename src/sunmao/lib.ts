import { SunmaoLib } from "@sunmao-ui/runtime";
import { Type, Static } from "@sinclair/typebox";
import { message } from "antd";
import { StringUnion } from "./helper";
import { Root } from "./components/Root";
import { Button } from "./components/Button";
import { UnstructuredTable } from "./components/UnstructuredTable";
import { ObjectAge } from "./components/ObjectAge";
import { UnstructuredSidebar } from "./components/UnstructuredSidebar";
import { UnstructuredForm } from "./components/UnstructuredForm";
import { UnstructuredCard } from "./components/UnstructuredCard";
import { Modal } from "./components/Modal";
import { Select } from "./components/Select";
import { Icon } from "./components/Icon";
import { CodeEditor } from "./components/CodeEditor";

const MessageParams = Type.Object({
  type: StringUnion(["success", "warn", "error", "info"]),
  message: Type.String(),
  duration: Type.Number(),
});

const OpenLinkParams = Type.Object({
  newWindow: Type.Boolean(),
  url: Type.String(),
});

export const libs: SunmaoLib[] = [
  {
    traits: [],
    components: [
      Root,
      Button,
      UnstructuredTable,
      ObjectAge,
      UnstructuredSidebar,
      UnstructuredForm,
      UnstructuredCard,
      Modal,
      Select,
      Icon,
      CodeEditor,
    ],
    utilMethods: [
      () => [
        {
          name: "message",
          method: (params: Static<typeof MessageParams>) => {
            message[params.type](params.message, params.duration);
          },
          parameters: MessageParams,
        },
        {
          name: "openLink",
          method: (params: Static<typeof OpenLinkParams>) => {
            window.open(params.url, params.newWindow ? "_blank" : undefined);
          },
          parameters: OpenLinkParams,
        },
      ],
    ],
  },
];

const yaml = import.meta.glob("./dependencies/yaml/*.yaml", {
  as: "raw",
});

export const dependencies = {
  yaml: Object.keys(yaml).reduce<Record<string, string>>((prev, cur) => {
    prev[cur.replace("./dependencies/yaml/", "").replace(".yaml", "")] = (yaml[
      cur
    ] as unknown) as string;
    return prev;
  }, {}),
};
