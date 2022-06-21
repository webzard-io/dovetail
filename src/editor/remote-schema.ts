import ky from "ky";
import _ from "lodash-es";
import { JSONSchema7 } from "json-schema";

const cache: { apiBases: string[]; openApi: any } = {
  apiBases: [],
  openApi: {},
};

export async function getApiBases(): Promise<string[]> {
  if (cache.apiBases.length) {
    return cache.apiBases;
  }
  const res = await ky.get("/proxy-k8s").json<{ paths: string[] }>();
  const bases = res.paths.filter((p) => /apis\/.*\//.test(p));
  cache.apiBases = bases;
  return bases;
}

export async function getResources(
  base: string,
  key: string
): Promise<string[]> {
  if (!cache.openApi.swagger) {
    cache.openApi = await ky.get("/proxy-k8s/openapi/v2").json<any>();
  }
  const [, , group, version] = base.split("/");
  const resources: string[] = [];
  for (const def of Object.keys(cache.openApi.definitions)) {
    const value = cache.openApi.definitions[def];
    if (!value["x-kubernetes-group-version-kind"]) {
      continue;
    }
    if (
      value["x-kubernetes-group-version-kind"][0].group !== group ||
      value["x-kubernetes-group-version-kind"][0].version !== version
    ) {
      continue;
    }
    if (key && !value.properties[key]) {
      continue;
    }
    resources.push(def);
  }
  return resources;
}

export async function getResourceSpec(def: string, key: string): Promise<any> {
  if (!cache.openApi.swagger) {
    cache.openApi = await ky.get("/proxy-k8s/openapi/v2").json<any>();
  }
  const properties = cache.openApi.definitions[def].properties;
  let spec = key ? properties[key] : properties;
  resolveRef(spec);
  return spec;
}

function resolveRef(schema: JSONSchema7) {
  if (schema.$ref) {
    const refKey = schema.$ref.replace("#/definitions/", "");
    Object.assign(schema, cache.openApi.definitions[refKey]);
  }
  switch (schema.type) {
    case "array":
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item) => resolveRef(item as JSONSchema7));
      } else if (typeof schema.items === "object" && "$ref" in schema.items) {
        resolveRef(schema.items);
      }
      break;
    case "object":
      for (const key in schema.properties) {
        resolveRef(schema.properties[key] as JSONSchema7);
      }
      break;
    default:
  }
}
