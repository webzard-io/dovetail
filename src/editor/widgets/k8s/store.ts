import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from "mobx";
import { JSONSchema7 } from "json-schema";
import { getFields } from "src/_internal/molecules/AutoForm/get-fields";
import K8sOpenAPI, { k8sOpenAPIMap } from "./remote-schema";

export class WidgetStore {
  resources = [];
  schemas: (JSONSchema7 | null)[] = [];

  constructor() {
    makeObservable(this, {
      resources: observable,
      schemas: observable,
      paths: computed,
      fetchResourcesSchemas: action,
    });
  }

  get paths() {
    if (this.schemas.length) {
      return this.schemas.map((schema) =>
        Object.keys(schema ? getFields(schema) : {})
      );
    }

    return [];
  }

  async fetchResourcesSchemas(basePath: string, resources: any[]) {
    const schemas = await Promise.all(
      resources.map(async (resource) => {
        const { apiVersionWithGroup, kind } = resource;
        const api = k8sOpenAPIMap[basePath] || new K8sOpenAPI({ basePath });

        k8sOpenAPIMap[basePath] = api;

        if (apiVersionWithGroup && kind) {
          const schema = await api.getResourceSchema(apiVersionWithGroup, kind);

          return schema;
        }

        return null;
      })
    );

    runInAction(() => {
      this.schemas = schemas;
    });

    return schemas;
  }
}

export default new WidgetStore();
