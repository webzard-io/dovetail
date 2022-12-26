import { JSONSchema7 } from "json-schema";
import { WidgetProps } from "./widget";

export function getFields(spec: JSONSchema7): Record<
  string,
  {
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
  if (spec.type === "object") {
    const properties = Object.keys(spec.properties || {});
    for (const name of properties) {
      const subSpec = (spec.properties || {})[name] as WidgetProps["spec"];
      if (typeof subSpec !== "boolean") {
        recursiveGetFields(subSpec, {
          ...ctx,
          path: ctx.path.concat(ctx.path ? `.${name}` : name),
        });
      }
    }
  } else if (spec.type === "string") {
  } else if (spec.type === "array") {
    const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;
    if (itemSpec && typeof itemSpec === "object") {
      recursiveGetFields(itemSpec, {
        ...ctx,
        path: ctx.path.concat(ctx.path ? ".$i" : "$i"),
      });
    }
    ctx.fields[ctx.path.concat(ctx.path ? ".$add" : "$add")] = {
      spec,
    };
  }

  ctx.fields[ctx.path || "*"] = {
    spec,
  };
}
