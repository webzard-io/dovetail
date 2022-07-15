import ky from "ky";
import pick from "lodash/pick";
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
  const bases = res.paths.filter((p) => {
    return /apis\/.*\//.test(p) || p.startsWith("/api/v1");
  });
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
  let [, , group, version] = base.split("/");
  if (base === "/api/v1") {
    group = "";
    version = "v1";
  }
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
  resolveRef(spec, {
    prune: {
      description: true,
      optional: false,
      fields: [],
      metadata: true,
      xProperty: true,
    },
  });
  return spec;
}

export async function getResourceSchema(
  apiVersion: string,
  kind: string
): Promise<any> {
  if (!cache.openApi.swagger) {
    cache.openApi = await ky.get("/proxy-k8s/openapi/v2").json<any>();
  }

  let schema;
  for (const def of Object.keys(cache.openApi.definitions)) {
    const value = cache.openApi.definitions[def];
    if (!value["x-kubernetes-group-version-kind"]) {
      continue;
    }
    const gvk = value["x-kubernetes-group-version-kind"][0];
    if (
      `${gvk.group ? `${gvk.group}/` : ""}${gvk.version}` === apiVersion &&
      value["x-kubernetes-group-version-kind"][0].kind === kind
    ) {
      schema = value;
      break;
    }
  }
  if (!schema) {
    return {};
  }
  resolveRef(schema, {
    prune: {
      description: true,
      optional: false,
      fields: [
        "finalizers",
        "managedFields",
        "resourceVersion",
        "generation",
        "selfLink",
        "ownerReferences",
      ],
      metadata: true,
      xProperty: true,
    },
  });
  return schema;
}

type ResolveOptions = {
  prune: {
    description: boolean;
    optional: boolean;
    metadata: boolean;
    fields: string[];
    xProperty: boolean;
  };
};

function resolveRef(schema: JSONSchema7, options: ResolveOptions) {
  const { prune } = options;
  if (schema.$ref) {
    const refKey = schema.$ref.replace("#/definitions/", "");
    Object.assign(schema, cache.openApi.definitions[refKey]);
    if (
      prune.metadata &&
      [
        "io.k8s.apimachinery.pkg.apis.meta.v1.ListMeta",
        "io.k8s.apimachinery.pkg.apis.meta.v1.ObjectMeta",
      ].some((k) => refKey.includes(k)) &&
      schema.properties
    ) {
      schema.properties = pick(schema.properties, [
        "name",
        "namespace",
        "annotations",
        "labels",
      ]);
    }
    delete schema.$ref;
  }
  for (const schemaKey in schema) {
    if (
      prune.xProperty &&
      schemaKey.startsWith("x-") &&
      schemaKey !== "x-kubernetes-group-version-kind"
    ) {
      delete schema[schemaKey as keyof JSONSchema7];
    }
  }
  switch (schema.type) {
    case "array":
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item) =>
          resolveRef(item as JSONSchema7, options)
        );
      } else if (typeof schema.items === "object") {
        resolveRef(schema.items, options);
      }
      break;
    case "object":
      for (const key in schema.properties) {
        const subSchema = schema.properties[key] as JSONSchema7;
        if (prune.optional && !schema.required?.includes(key)) {
          delete schema.properties[key];
        }
        if (prune.fields.includes(key)) {
          delete schema.properties[key];
        }
        resolveRef(subSchema, options);
      }
      break;
    default:
  }
  if (prune.description) {
    delete schema.description;
  }
}
