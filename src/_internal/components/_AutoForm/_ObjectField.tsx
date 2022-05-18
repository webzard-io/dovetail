import React from "react";
import SpecField from "./_SpecField";
import { WidgetProps } from "./widget";

export const ObjectField: React.FC<WidgetProps> = (props) => {
  const { spec, value, path, level, onChange, renderer } = props;

  const properties = Object.keys(spec.properties || {});
  return (
    <>
      {properties.map((name) => {
        const subSpec = (spec.properties || {})[name] as WidgetProps["spec"];

        if (typeof subSpec === "boolean") {
          return null;
        }

        return (
          <SpecField
            key={name}
            spec={{
              ...subSpec,
              title: subSpec.title || name,
            }}
            path={path.concat(`.${name}`)}
            renderer={renderer}
            level={level + 1}
            value={value?.[name]}
            onChange={(newValue) => {
              onChange({
                ...value,
                [name]: newValue,
              });
            }}
          />
        );
      })}
    </>
  );
};

export default ObjectField;
