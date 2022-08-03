import { initSunmaoUIEditor } from "@sunmao-ui/editor";
import { useState, useEffect, useMemo } from "react";
import { SunmaoUIRuntimeProps } from "@sunmao-ui/runtime";
import type { Application, Module } from "@sunmao-ui/core";
import { widgets as editorWidgets } from "./editor/widgets";

type FsManagerOptions = { name: string };
class FsManager {
  name: string;

  constructor(options: FsManagerOptions) {
    this.name = options.name;
    this.getApp = this.getApp.bind(this);
    this.getModules = this.getModules.bind(this);
    this.saveApp = this.saveApp.bind(this);
    this.saveModules = this.saveModules.bind(this);
  }

  get endpoint() {
    return `/sunmao-fs/${this.name}`;
  }

  async getApp(): Promise<Application> {
    const resp = await (await fetch(this.endpoint)).json();
    if (resp.application.kind === "Application") {
      return resp.application;
    }
    throw new Error("failed to load schema");
  }

  async getModules(): Promise<Module[]> {
    const resp = await (await fetch(this.endpoint)).json();
    if (Array.isArray(resp.modules)) {
      return resp.modules;
    }
    throw new Error("failed to load schema");
  }

  async saveApp(app: Application) {
    await fetch(this.endpoint, {
      method: "put",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        scope: "application",
        value: app,
      }),
    });
  }

  async saveModules(modules: Module[]) {
    await fetch(this.endpoint, {
      method: "put",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        scope: "modules",
        value: modules,
      }),
    });
  }
}

const DEFAULT_APP: Application = {
  version: "sunmao/v1",
  kind: "Application",
  metadata: {
    name: "some App",
  },
  spec: {
    components: [],
  },
};

export default function registerEditor(
  managerOptions: FsManagerOptions,
  runtimeProps?: SunmaoUIRuntimeProps
) {
  const fsManager = new FsManager(managerOptions);

  return function App() {
    const [app, setApp] = useState(JSON.parse(JSON.stringify(DEFAULT_APP)));
    const [modules, setModules] = useState<Module[]>([]);

    const { Editor: SunmaoEditor } = useMemo(() => {
      const { Editor } = initSunmaoUIEditor({
        defaultApplication: app,
        defaultModules: modules,
        storageHandler: {
          onSaveApp: fsManager.saveApp,
          onSaveModules: fsManager.saveModules,
        },
        runtimeProps,
        widgets: editorWidgets,
      });

      return { Editor };
    }, [app, modules]);

    useEffect(() => {
      fsManager.getApp().then(setApp);
      // fsManager.getModules().then(setModules);
    }, []);

    return <SunmaoEditor />;
  };
}
