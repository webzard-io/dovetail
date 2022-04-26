import React from "react";
import {
  initSunmaoUI,
  SunmaoLib,
  SunmaoUIRuntimeProps,
} from "@sunmao-ui/runtime";
import type { Schema } from "./types";

function registerSunmaoApp(
  schema: Schema,
  libs: SunmaoLib[],
  options: SunmaoUIRuntimeProps = {}
) {
  const { App: SunmaoApp, registry } = initSunmaoUI(options);
  libs.forEach((lib) => registry.installLib(lib));
  schema.modules?.forEach((module) => registry.registerModule(module));
  options.utilMethods?.forEach((method) => {
    registry.registerUtilMethod(method);
  });

  function App() {
    return (
      <SunmaoApp
        debugEvent={false}
        debugStore={false}
        options={schema.application}
      />
    );
  }

  return App;
}

export default registerSunmaoApp;
