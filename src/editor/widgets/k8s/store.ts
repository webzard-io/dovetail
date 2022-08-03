import {
  makeObservable,
  observable,
  computed,
  flow,
} from "mobx";
import { JSONSchema7 } from "json-schema";
import { getFields } from "src/_internal/molecules/AutoForm/get-fields";
import { getResourceSchema } from "./remote-schema";

export class WidgetStore {
  resources = [];
  schemas: JSONSchema7[] = [];

  constructor() {
    makeObservable(this, {
      resources: observable,
      schemas: observable,
      paths: computed,
      fetchResourcesSchemas: flow,
    });
  }

  get paths() {
    if (this.schemas.length) {
      return this.schemas.map((schema) => Object.keys(getFields(schema)));
    }

    return [];
  }

  async fetchResourcesSchemas(resources: any[]) {
    const schemas = (
      await Promise.all(
        resources.map(async (resource) => {
          const { apiVersionWithGroup, kind } = resource;

          if (apiVersionWithGroup && kind) {
            const schema = await getResourceSchema(apiVersionWithGroup, kind);

            return schema;
          }

          return null;
        })
      )
    ).filter((schema): schema is JSONSchema7 => schema !== null);

    this.schemas = schemas;

    return schemas;
  }
}

export default new WidgetStore();
