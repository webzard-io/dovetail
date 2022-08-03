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

    const onChange = useCallback(
      (value: string) => {
        if (value && map[value]) {
          const apiPath = `${apiBase}/${value}`;
          const { apiVersionWithGroup } = parseKubeApi(apiPath);

          store.fetchResourcesSchemas([
            {
              apiVersionWithGroup,
              kind: map[value].kind,
            },
          ]);

          props.onChange(value);
        }
      },
      [store, props.onChange, map]
    );

    useEffect(() => {
      // fetch the resources list
      (async function () {
        if (apiBase) {
          const resources = await getResources(apiBase);

          setResources(resources);
        }
      })();
    }, [apiBase]);
    useEffect(() => {
      // select the first resource when the resources change
      if (!Object.keys(map).includes(props.value)) {
        onChange(first(resources)?.name || '');
      }
    }, [props.value, map, resources, onChange]);

    return (
      <StringField
        {...props}
        spec={StringUnion(resources.map(({ name }) => name))}
        onChange={onChange}
      ></StringField>
    );
  })
);
