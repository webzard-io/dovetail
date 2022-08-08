import { implementWidget, StringField } from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import { getResources, type Resource } from "../remote-schema";
import { useState, useEffect, useCallback, useMemo } from "react";
import { first } from "lodash";
import store from "../store";
import { observer } from "mobx-react-lite";
import { parseKubeApi } from "src/_internal/k8s-api-client/kube-api";

export default implementWidget({
  version: "kui/v1",
  metadata: {
    name: "ResourceWidget",
  },
})(
  observer(function ResourceWidget(props) {
    const { component } = props;
    const [resources, setResources] = useState<Resource[]>([]);
    const apiBase = component.properties.apiBase as string;

    const map = useMemo(() => {
      return resources.reduce((result: Record<string, any>, resource) => {
        result[resource.name] = resource;

        return result;
      }, {});
    }, [resources]);

    const fetchResourceSchema = useCallback(
      (resource: string) => {
        const apiPath = `${apiBase}/${resource}`;
        const { apiVersionWithGroup } = parseKubeApi(apiPath);

        store.fetchResourcesSchemas([
          {
            apiVersionWithGroup,
            kind: map[resource].kind,
          },
        ]);
      },
      [apiBase, map]
    );

    useEffect(() => {
      // fetch the resources list
      (async function () {
        const oldResources = resources;

        if (apiBase) {
          const resources = await getResources(apiBase);

          setResources(resources);
          if (oldResources.length) {
            // the resources was changed
            props.onChange(first(resources)?.name || "");
          }
        }
      })();
      // only execute when the `apiBase` change
    }, [apiBase]);
    useEffect(() => {
      if (props.value && map[props.value]) {
        fetchResourceSchema(props.value);
      }
    }, [props.value, map, fetchResourceSchema]);

    return (
      <StringField
        {...props}
        spec={StringUnion(resources.map(({ name }) => name))}
      ></StringField>
    );
  })
);
