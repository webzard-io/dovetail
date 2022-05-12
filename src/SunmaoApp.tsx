import React from "react";
import { initSunmaoUI, SunmaoUIRuntimeProps } from "@sunmao-ui/runtime";
import type { Schema } from "./types";

function registerSunmaoApp(schema: Schema, options: SunmaoUIRuntimeProps = {}) {
  const { App: SunmaoApp, registry } = initSunmaoUI(options);
  schema.modules?.forEach((module) => registry.registerModule(module));

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
