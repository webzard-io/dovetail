import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sunmaoFsVitePlugin from "./tools/sunmao-fs-vite-plugin";
import linariaVitePlugin from "./tools/linaria-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import { load } from "js-yaml";

const globalSassPath = path.resolve(
  __dirname,
  "./src/themes/CloudTower/styles/variables.scss"
);
const globalSass = fs.readFileSync(globalSassPath, "utf-8");

const rawKubeConfig = fs.readFileSync(
  path.resolve(os.homedir(), ".kube/config"),
  "utf-8"
);
const kubeConfig: any = load(rawKubeConfig);
const kubeContext = kubeConfig.contexts[0];
console.log("using context", kubeContext.name);
const cluster = kubeConfig.clusters.find(
  (c) => c.name === kubeContext.context.cluster
);
const user = kubeConfig.users.find((u) => u.name === kubeContext.context.user);

const serverUrl = new URL(cluster.cluster.server);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/proxy": {
        target: {
          host: serverUrl.hostname,
          port: serverUrl.port,
          protocol: "https:",
          key: Buffer.from(user.user["client-key-data"], "base64").toString(),
          cert: Buffer.from(
            user.user["client-certificate-data"],
            "base64"
          ).toString(),
        },
        rewrite: (path) => path.replace(/^\/proxy/, ""),
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    sunmaoFsVitePlugin({
      schemas: [
        {
          name: "main",
          path: path.resolve(__dirname, "./src/sunmao/schema.json"),
        },
      ],
    }),
    linariaVitePlugin({ preprocessor: "none", extension: ".scss" }),
    react(),
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
