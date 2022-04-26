import { Plugin } from "vite";
import * as fs from "fs";
import bodyParser from "body-parser";

type Options = {
  schemas: { path: string; name: string }[];
};

const sunmaoFsVitePlugin: (options: Options) => Plugin = (options) => {
  const getSchema = (url) => {
    const name = url.replace(/^\//, "");
    return options.schemas.find((s) => s.name === name);
  };
  return {
    name: "sunmao-fs-server",
    configureServer(server) {
      server.middlewares.use("/sunmao-fs", bodyParser.json());
      server.middlewares.use("/sunmao-fs", (req, res, next) => {
        switch (req.method.toLowerCase()) {
          case "get": {
            const schemaConfig = getSchema(req.url);
            if (!schemaConfig) {
              return res.end(JSON.stringify({ error: "schema not found" }));
            }
            res.end(fs.readFileSync(schemaConfig.path, "utf-8"));
            break;
          }
          case "put": {
            const { scope, value } = (req as any).body;
            const schemaConfig = getSchema(req.url);
            if (!schemaConfig) {
              return res.end(JSON.stringify({ error: "schema not found" }));
            }
            const schema = JSON.parse(
              fs.readFileSync(schemaConfig.path, "utf-8")
            );
            schema[scope] = value;
            fs.writeFileSync(
              schemaConfig.path,
              JSON.stringify(schema, null, 2)
            );
            res.end(JSON.stringify({ result: "done" }));
            break;
          }
          default:
            res.end("invalid method");
        }
      });
    },
  };
};

export default sunmaoFsVitePlugin;
