import { SunmaoLib } from "@sunmao-ui/runtime";
import { Type, Static } from "@sinclair/typebox";
import { message } from "antd";
import { Root } from "./components/Root";
import { Button } from "./components/Button";
import { UnstructuredTable } from "./components/UnstructuredTable";
import { ObjectAge } from "./components/ObjectAge";
import { UnstructuredSidebar } from "./components/UnstructuredSidebar";
import { UnstructuredForm } from "./components/UnstructuredForm";
import { Modal } from "./components/Modal";
import { StringUnion } from "./helper";

const MessageParams = Type.Object({
  type: StringUnion(["success", "warn", "error", "info"]),
  message: Type.String(),
  duration: Type.Number(),
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
      Modal,
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
      ],
    ],
  },
];
