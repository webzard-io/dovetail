import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { load } from "js-yaml";

const rawKubeConfig = fs.readFileSync(
  path.resolve(os.homedir(), ".kube/config"),
  "utf-8"
);
const kubeConfig: any = load(rawKubeConfig);
const kubeContext = kubeConfig.contexts.find(
  (ctx) => ctx.name === kubeConfig["current-context"]
);
console.log("using context", kubeContext.name);
const cluster = kubeConfig.clusters.find(
  (c) => c.name === kubeContext.context.cluster
);
const user = kubeConfig.users.find((u) => u.name === kubeContext.context.user);
const serverUrl = new URL(cluster.cluster.server);

export function getProxyConfig() {
  return {
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
  };
}
