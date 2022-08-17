import ky from "ky";
import pick from "lodash/pick";
import { JSONSchema7 } from "json-schema";

type Cache = {
  apiBases: string[];
  openApi: any;
  kinds: string[];
};

export type Resource = {
  name: string;
};

type ResolveOptions = {
  prune: {
    description: boolean;
    optional: boolean;
    metadata: boolean;
    fields: string[];
    xProperty: boolean;
  };
};

type K8sOpenAPIOptions = {
  basePath: string;
};

class K8sOpenAPI {
  cache: Cache = {
    apiBases: [],
    openApi: {},
    kinds: [],
  };

  constructor(private options: K8sOpenAPIOptions) {}

  resolveRef(schema: JSONSchema7, options: ResolveOptions) {
    const { prune } = options;

    if (schema.$ref) {
      const refKey = schema.$ref.replace("#/definitions/", "");
      Object.assign(schema, this.cache.openApi.definitions[refKey]);
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
            this.resolveRef(item as JSONSchema7, options)
          );
        } else if (typeof schema.items === "object") {
          this.resolveRef(schema.items, options);
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
          this.resolveRef(subSchema, options);
        }
        break;
      default:
    }
    if (prune.description) {
      delete schema.description;
    }
  }

  async getApiBases(): Promise<string[]> {
    if (this.cache.apiBases.length) {
      return this.cache.apiBases;
    }

    const res = await ky.get(this.options.basePath).json<{ paths: string[] }>();
    const bases = res.paths.filter((p) => {
      return /apis\/.*\//.test(p) || p.startsWith("/api/v1");
    });

    this.cache.apiBases = bases;

    return bases;
  }

  async getKinds(): Promise<string[]> {
    if (this.cache.kinds.length) {
      return this.cache.kinds;
    }

    const openApi = this.cache.openApi.swagger
      ? this.cache.openApi
      : await ky.get(`${this.options.basePath}/openapi/v2`).json<any>();
    const kinds = new Set<string>();

    Object.keys(openApi.definitions).forEach((key) => {
      const definition = openApi.definitions[key];

      if (definition["x-kubernetes-group-version-kind"]) {
        definition["x-kubernetes-group-version-kind"].forEach(
          ({ kind }: { kind: string }) => {
            kinds.add(kind);
          }
        );
      }
    });

    this.cache.openApi = openApi;
    this.cache.kinds = [...kinds];

    return [...kinds];
  }

  async getResources(api: string): Promise<Resource[]> {
    const { resources } = await ky
      .get(`${this.options.basePath}${api}`)
      .json<{ resources: Resource[] }>();

    return resources;
  }

  async getDefinitions(base: string, key: string): Promise<string[]> {
    if (!this.cache.openApi.swagger) {
      this.cache.openApi = await ky
        .get(`${this.options.basePath}/openapi/v2`)
        .json<any>();
    }

    let [, , group, version] = base.split("/");
    if (base === "/api/v1") {
      group = "";
      version = "v1";
    }
    const resources: string[] = [];

    for (const def of Object.keys(this.cache.openApi.definitions)) {
      const value = this.cache.openApi.definitions[def];

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

  async getResourceSpec(def: string, key: string): Promise<any> {
    if (!this.cache.openApi.swagger) {
      this.cache.openApi = await ky
        .get(`${this.options.basePath}/openapi/v2`)
        .json<any>();
    }

    const properties = this.cache.openApi.definitions[def].properties;
    let spec = key ? properties[key] : properties;

    this.resolveRef(spec, {
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

  async getResourceSchema(
    apiVersionWithGroup: string,
    kind: string
  ): Promise<JSONSchema7 | null> {
    if (!this.cache.openApi.swagger) {
      this.cache.openApi = await ky
        .get(`${this.options.basePath}/openapi/v2`)
        .json<any>();
    }

    let schema;

    for (const def of Object.keys(this.cache.openApi.definitions)) {
      const value = this.cache.openApi.definitions[def];
      if (!value["x-kubernetes-group-version-kind"]) {
        continue;
      }
      const gvk = value["x-kubernetes-group-version-kind"][0];
      if (
        `${gvk.group ? `${gvk.group}/` : ""}${gvk.version}` ===
          apiVersionWithGroup &&
        value["x-kubernetes-group-version-kind"][0].kind === kind
      ) {
        schema = value;
        break;
      }
    }

    if (!schema) {
      return null;
    }

    this.resolveRef(schema, {
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
}

export const k8sOpenAPIMap: Record<string, K8sOpenAPI> = {};

export default K8sOpenAPI;
