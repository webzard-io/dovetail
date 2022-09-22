import { SunmaoLib, implementUtilMethod } from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { message } from "antd";
import { StringUnion } from "./helper";
import { Root } from "./components/Root";
import { Button } from "./components/Button";
import { KubectlGetTable } from "./components/KubectlGetTable";
import { ObjectAge } from "./components/ObjectAge";
import { UnstructuredSidebar } from "./components/UnstructuredSidebar";
import { UnstructuredPage } from "./components/UnstructuredPage";
import { Modal } from "./components/Modal";
import { Modal as FullscreenModal } from "./components/FullscreenModal";
import { Select } from "./components/Select";
import { Icon } from "./components/Icon";
import { CodeEditor } from "./components/CodeEditor";
import { KubectlApplyForm } from "./components/KubectlApplyForm";
import { KubectlGetDetail } from "./components/KubectlGetDetail";
import { KubectlGetList } from "./components/KubectlGetList";

import SyncKubectlApplyForm from "./traits/SyncKubectlApplyForm";
import KubeAPITrait from "./traits/KubeAPITrait";

const MessageParams = Type.Object({
  type: StringUnion(["success", "warn", "error", "info", "loading"]),
  message: Type.String(),
  duration: Type.Number(),
});

const OpenLinkParams = Type.Object({
  newWindow: Type.Boolean(),
  url: Type.String(),
});

export const libs: SunmaoLib[] = [
  {
    traits: [SyncKubectlApplyForm, KubeAPITrait],
    components: [
      Root,
      Button,
      KubectlGetTable,
      ObjectAge,
      UnstructuredSidebar,
      UnstructuredPage,
      Modal,
      Select,
      Icon,
      CodeEditor,
      KubectlApplyForm,
      KubectlGetDetail,
      KubectlGetList,
      FullscreenModal,
    ],
    utilMethods: [
      () =>
        implementUtilMethod({
          version: "kui/v1",
          metadata: {
            name: "closeMessage",
          },
          spec: {
            parameters: Type.Object({}),
          },
        })((params) => {
          message.destroy();
        }),
      () =>
        implementUtilMethod({
          version: "kui/v1",
          metadata: {
            name: "message",
          },
          spec: {
            parameters: MessageParams,
          },
        })((params) => {
          message[params.type](params.message, params.duration);
        }),
      () =>
        implementUtilMethod({
          version: "kui/v1",
          metadata: {
            name: "openLink",
          },
          spec: {
            parameters: OpenLinkParams,
          },
        })((params) => {
          window.open(params.url, params.newWindow ? "_blank" : undefined);
        }),
    ],
  },
];

const yaml = import.meta.glob("./dependencies/yaml/*.yaml", {
  as: "raw",
});

export const dependencies = {
  yaml: Object.keys(yaml).reduce<Record<string, string>>((prev, cur) => {
    prev[cur.replace("./dependencies/yaml/", "").replace(".yaml", "")] = yaml[
      cur
    ] as unknown as string;
    return prev;
  }, {}),
};
