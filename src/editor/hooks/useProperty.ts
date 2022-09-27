import { useMemo } from "react";
import { ComponentSchema } from "@sunmao-ui/core";
import { get } from "lodash";

type Props = {
  services: any;
  component: ComponentSchema;
  path: string[];
  key: string;
};

function useProperty({ services, component, path, key }: Props) {
  const property = useMemo(() => {
    const properties = [
      component.properties,
      ...component.traits.map((trait) => trait.properties),
    ].find((properties) => key in properties);

    return (get(properties, path.slice(0, -1).concat([key]).join(".")) ||
      "") as string;
  }, [component, path]);

  return services.stateManager.deepEval(property);
}

export default useProperty;
