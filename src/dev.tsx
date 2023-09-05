import React from "react";
import { render } from "react-dom";
import VisualEditor from "./VisualEditor";
import { initParrotI18n, UIKitProvider } from "@cloudtower/eagle";
// Set Up Style
import "antd/dist/antd.css";
import "@cloudtower/eagle/dist/style.css";

initParrotI18n();

const container = document.getElementById("root")!;
render((
  <UIKitProvider>
    <VisualEditor />
  </UIKitProvider>
), container);
