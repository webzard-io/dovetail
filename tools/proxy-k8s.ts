import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { load, loadAll } from "js-yaml";
import bodyParser from "body-parser";
import * as k8s from "@kubernetes/client-node";
import { Plugin } from "vite";

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

function getKeyAndCert(): { key: string; cert: string } {
  let key = "";
  let cert = "";
  if (user.user["client-key-data"]) {
    key = Buffer.from(user.user["client-key-data"], "base64").toString();
  } else if (user.user["client-key"]) {
    key = fs.readFileSync(user.user["client-key"], "utf-8");
  }

  if (user.user["client-certificate-data"]) {
    cert = Buffer.from(
      user.user["client-certificate-data"],
      "base64"
    ).toString();
  } else if (user.user["client-certificate"]) {
    cert = fs.readFileSync(user.user["client-certificate"], "utf-8");
  }

  return {
    key,
    cert,
  };
}

const { key, cert } = getKeyAndCert();

export function getProxyConfig() {
  return {
    target: {
      host: serverUrl.hostname,
      port: serverUrl.port,
      protocol: "https:",
      key,
      cert,
    },
    rewrite: (path) => path.replace(/^\/proxy-k8s/, ""),
    secure: false,
    changeOrigin: true,
    proxyTimeout: 0,
    timeout: 0,
  };
}

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const client = k8s.KubernetesObjectApi.makeApiClient(kc);

export const applyK8sYamlPlugin: () => Plugin = () => {
  return {
    name: "apply-k8s-yaml",
    configureServer(server) {
      server.middlewares.use("/raw-yaml", bodyParser.raw());
      server.middlewares.use("/raw-yaml", async (req, res, next) => {
        const raw = (req as any).body;
        const specs: k8s.KubernetesObject[] = loadAll(raw);
        const validSpecs = specs.filter((s) => s && s.kind && s.metadata);
        switch (req.method.toLowerCase()) {
          case "post": {
            const created: k8s.KubernetesObject[] = [];
            for (const spec of validSpecs) {
              spec.metadata = spec.metadata || {};
              spec.metadata.annotations = spec.metadata.annotations || {};
              delete spec.metadata.annotations[
                "kubectl.kubernetes.io/last-applied-configuration"
              ];
              spec.metadata.annotations[
                "kubectl.kubernetes.io/last-applied-configuration"
              ] = JSON.stringify(spec);
              try {
                await client.read(spec);
                const response = await client.patch(spec);
                created.push(response.body);
              } catch (e) {
                try {
                  const response = await client.create(spec);
                  created.push(response.body);
                } catch (e) {
                  console.error(e.body || e);
                }
              }
            }
            res.end(JSON.stringify(created));
            break;
          }
          case "delete": {
            const deleted: k8s.V1Status[] = [];
            for (const spec of validSpecs) {
              spec.metadata = spec.metadata || {};
              spec.metadata.annotations = spec.metadata.annotations || {};
              try {
                const response = await client.delete(spec);
                deleted.push(response.body);
              } catch (e) {
                console.error(e.body || e);
              }
            }
            res.end(JSON.stringify(deleted));
            break;
          }
          default:
            res.end("invalid method");
        }
      });
    },
  };
};
