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

  if (ctx.path) {
    ctx.fields[ctx.path] = {
      spec,
    };
  } else {
    ctx.fields["*"] = {
      spec: getFieldsForWildcard(spec),
    };
  }
}

function getFieldsByLevel(spec: JSONSchema7, level = 0, maxLevel = 0) {
  const newSpec: JSONSchema7 = {
    ...spec,
    properties: {},
  };

  for (const key in spec.properties) {
    const propertySpec = spec.properties[key];

    if (typeof propertySpec !== "boolean") {
      switch (propertySpec.type) {
        case "object": {
          if (level < maxLevel) {
            const objectSpec = getFieldsByLevel(
              propertySpec,
              level + 1,
              maxLevel
            );

            if (Object.keys(objectSpec.properties).length) {
              newSpec.properties[key] = objectSpec;
            }
          }
          break;
        }
        case "array": {
          if (
            propertySpec.items instanceof Array === false &&
            propertySpec.items.type !== "object" &&
            propertySpec.items.type !== "array"
          ) {
            newSpec.properties[key] = propertySpec;
          }
          break;
        }
        default: {
          newSpec.properties[key] = propertySpec;
          break;
        }
      }
    }
  }

  return newSpec;
}

function getFieldsForWildcard(spec: JSONSchema7) {
  return getFieldsByLevel(spec, 0, 2);
}
