import * as path from "path";
import * as fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginImp from "vite-plugin-imp";
import sunmaoFsVitePlugin from "./tools/sunmao-fs-vite-plugin";
import linariaVitePlugin from "./tools/linaria-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import { getProxyConfig, applyK8sYamlPlugin } from "./tools/proxy-k8s";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { visualizer } from 'rollup-plugin-visualizer'

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
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'js'}`,
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
        "monaco-editor",
        "monaco-yaml",
        "@cloudtower/eagle",
        "antd"
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      "/proxy-k8s": getProxyConfig(),
      "/api": {
        target: "http://10.255.4.115",
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
    linariaVitePlugin({ preprocessor: "none", extension: ".scss" }),
    react(),
    applyK8sYamlPlugin(),
    monacoEditorPlugin({
      languageWorkers: ["json", "editorWorkerService"],
    }),
    visualizer(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `${globalSass}\r\n`,
      },
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
