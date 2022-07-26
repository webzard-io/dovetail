import { implementWidget, StringField } from "@sunmao-ui/editor-sdk";
import { StringUnion } from "@sunmao-ui/shared";
import { getDefinitions, getResources, type Resource } from "./remote-schema";
import { useState, useEffect, useCallback, useMemo } from "react";
import { get } from "lodash";
import store from "./store";
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
    const [isInit, setIsInit] = useState<boolean>(false);
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
      (async function () {
        if (apiBase) { 
          const resources = await getResources(apiBase);
  
          setResources(resources);
        }
      })();
    }, [apiBase]);
    useEffect(() => {
      if (props.value && isInit === false && resources.length) {
        onChange(props.value);
        setIsInit(true);
      }
    }, [props.value, isInit, resources, onChange]);

    return (
      <StringField
        {...props}
        spec={StringUnion(resources.map(({ name }) => name))}
        onChange={onChange}
      ></StringField>
    );
  })
);
