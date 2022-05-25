import * as path from "path";
import * as fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sunmaoFsVitePlugin from "./tools/sunmao-fs-vite-plugin";
import linariaVitePlugin from "./tools/linaria-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import { getProxyConfig, applyK8sYamlPlugin } from "./tools/proxy-k8s";

const globalSassPath = path.resolve(
  __dirname,
  "./src/themes/CloudTower/styles/variables.scss"
);
const globalSass = fs.readFileSync(globalSassPath, "utf-8");

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/proxy-k8s": getProxyConfig(),
      "/api": {
        target: "http://192.168.31.181",
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
          name: "logging",
          path: path.resolve(__dirname, "./src/sunmao/logging.json"),
        },
      ],
    }),
    linariaVitePlugin({ preprocessor: "none", extension: ".scss" }),
    react(),
    applyK8sYamlPlugin(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `${globalSass}\r\n`,
      },
      less: {
        modifyVars: {
          "@primary-color": "#0080FF",
          "@link-color": "#0080FF",
          "@text-color": "#06101F",
          "@success-color": "#25C764",
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
