import * as path from "path";
import * as fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getThemeVariables } from "antd/dist/theme";
import vitePluginImp from "vite-plugin-imp";
import sunmaoFsVitePlugin from "./tools/sunmao-fs-vite-plugin";
import linariaVitePlugin from "./tools/linaria-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import { getProxyConfig, applyK8sYamlPlugin } from "./tools/proxy-k8s";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

const globalSassPath = path.resolve(
  __dirname,
  "./src/_internal/atoms/themes/CloudTower/styles/variables.scss"
);
const globalSass = fs.readFileSync(globalSassPath, "utf-8");

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        widgets: path.resolve(__dirname, "src/widgets.ts"),
      },
      name: "Kui",
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "semver",
        "@sunmao-ui/core",
        "@sunmao-ui/runtime",
        "@sunmao-ui/editor-sdk",
        "chakra-react-select",
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      "/proxy-k8s": getProxyConfig(),
      "/api": {
        target: "http://10.255.5.44",
        ws: true,
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    sunmaoFsVitePlugin({
      schemas: [
        {
          name: "lcm",
          path: path.resolve(__dirname, "./src/sunmao/lcm.json"),
        },
        {
          name: "fiddle",
          path: path.resolve(__dirname, "./src/sunmao/fiddle.json"),
        },
        {
          name: "yzFiddle",
          path: path.resolve(__dirname, "./src/sunmao/yz-fiddle.json"),
        },
        {
          name: "kgt",
          path: path.resolve(__dirname, "./src/sunmao/kgt.json"),
        },
        {
          name: "deployment",
          path: path.resolve(__dirname, "./src/sunmao/deployment.json"),
        },
        {
          name: "validation",
          path: path.resolve(__dirname, "./src/sunmao/validation.json"),
        },
      ],
    }),
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
    linariaVitePlugin({ preprocessor: "none", extension: ".scss" }),
    react(),
    applyK8sYamlPlugin(),
    monacoEditorPlugin({
      languageWorkers: ["json", "editorWorkerService"],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `${globalSass}\r\n`,
      },
      less: {
        modifyVars: {
          "@ant-prefix": "dovetail-ant",
          "@primary-color": "#0080FF",
          "@link-color": "#0080FF",
          "@text-color": "#06101F",
          "@success-color": "#25C764",
          "@error-color": "#f0483e",
          "@border-radius-base": "3px",
          "@screen-xs": "1279px",
          "@screen-sm": "1536px",
          "@screen-md": "2176px",
          "@screen-lg": "2304px",
        },
        javascriptEnabled: true,
      },
    },
  },
});
