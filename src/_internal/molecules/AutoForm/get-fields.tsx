import React from "react";
import { JSONSchema7 } from "json-schema";
import { WidgetProps } from "./widget";
import UnsupportedField from "./UnsupportedField";
import StringField from "./StringField";
import ArrayField, { AddToArrayField } from "./ArrayField";
import BooleanField from "./BooleanField";
import NumberField from "./NumberField";
import NullField from "./NullField";
import ObjectField from "./ObjectField";
import MultiSpecField from "./MultiSpecField";

export function getFields(
  spec: JSONSchema7
): Record<
  string,
  {
    Component: React.FC<WidgetProps>;
    spec: JSONSchema7;
  }
> {
  const ctx: RecursiveContext = {
    path: "",
    fields: {},
  };
  recursiveGetFields(spec, ctx);
  return ctx.fields;
}

type RecursiveContext = {
  path: string;
  fields: ReturnType<typeof getFields>;
};

function recursiveGetFields(spec: JSONSchema7, ctx: RecursiveContext) {
  let Component = UnsupportedField;
  if (spec.type === "object") {
    Component = ObjectField;
    const properties = Object.keys(spec.properties || {});
    for (const name of properties) {
      const subSpec = (spec.properties || {})[name] as WidgetProps["spec"];
      if (typeof subSpec !== "boolean") {
        recursiveGetFields(subSpec, {
          ...ctx,
          path: ctx.path.concat(`.${name}`),
        });
      }
    }
  } else if (spec.type === "string") {
    Component = StringField;
  } else if (spec.type === "array") {
    Component = ArrayField;
    const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;
    if (itemSpec && typeof itemSpec === "object") {
      recursiveGetFields(itemSpec, {
        ...ctx,
        path: ctx.path.concat(`.$i`),
      });
    }
    ctx.fields[ctx.path.concat(`.$add`)] = {
      Component: AddToArrayField,
      spec,
    };
  } else if (spec.type === "boolean") {
    Component = BooleanField;
  } else if (spec.type === "integer" || spec.type === "number") {
    Component = NumberField;
  } else if (spec.type === "null") {
    Component = NullField;
  } else if ("anyOf" in spec || "oneOf" in spec) {
    Component = MultiSpecField;
  }

  ctx.fields[ctx.path || ".*"] = {
    Component,
    spec,
  };
}
