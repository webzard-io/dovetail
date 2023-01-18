import type {
  Group,
  Item,
  ObjectItem,
  SubHeading,
  Label,
} from "../../atoms/themes/CloudTower/components/SummaryList";
import { Layout, Field } from "./type";
import { Services } from "./type";
import { get } from "lodash";

function getValueByPath(
  formData: Record<string, any>,
  displayValues: Record<string, any>,
  path: string,
  fullPath: string
): unknown {
  if (path.includes("$add") || path.includes("$i")) {
    if (path.includes(".$i.")) {
      // has sub path
      const [arrayPath, subPath] = path.split(".$i.");
      const array: any[] =
        displayValues[fullPath] || get(formData, arrayPath) || [];

      return array.map((item: any) =>
        getValueByPath(
          item,
          displayValues,
          subPath,
          fullPath ? `${fullPath}.${subPath}` : subPath
        )
      );
    }
  } else {
    return displayValues[fullPath] || get(formData, path);
  }
}

function getListItems(
  fields: Field[],
  formData: Record<string, any>,
  displayValues: Record<string, any>,
  services: Services,
  parentPath: string
): (Item | ObjectItem | SubHeading | Label)[] {
  const removableMap = services.store.summary.removableMap;

  return fields
    .map((field) => {
      const items: (Item | ObjectItem | SubHeading | Label)[] = [];

      if (field.summaryConfig?.hidden || field.condition === false) {
        return items;
      }

      if (field.sectionTitle) {
        items.push({
          type: "SubHeading" as const,
          title: field.sectionTitle,
        });
      }

      const path = field.path.replace(/(.\$add)|(.\$i)/g, (substring) => {
        if (substring === ".$add") {
          // 0.spec.topology.workers.$add -> 0.spec.topology.workers
          return "";
        } else {
          // 0.spec.topology.workers.$i.name -> 0.spec.topology.workers.0.name
          return ".0";
        }
      });
      const value: unknown = getValueByPath(
        formData,
        displayValues,
        path,
        parentPath ? `${parentPath}.${path}` : path
      );

      if (field.summaryConfig?.type === "item") {
        items.push({
          type: "Item" as const,
          label: field.summaryConfig.label || field.label,
          value: field.summaryConfig.value || JSON.stringify(value),
        });
      } else if (field.type === "layout") {
        if (field.layoutWidget === "default") {
          items.push(
            ...getListItems(
              field.fields || [],
              formData,
              displayValues,
              services,
              parentPath
            )
          );
        } else {
          items.push({
            type: "Object" as const,
            label: `${
              field.summaryConfig?.label ||
              field.widgetOptions?.title ||
              field.label ||
              "Group"
            }`,
            icon: field.summaryConfig?.icon || field.widgetOptions?.icon,
            items: getListItems(
              field.fields || [],
              formData,
              displayValues,
              services,
              parentPath
            ) as Item[],
          });
        }
      } else {
        if (value instanceof Array) {
          if (typeof value[0] !== "object") {
            items.push({
              type: "Item" as const,
              label: field.label,
              value: "",
            });
          }

          value.forEach((item, index) => {
            if (item && typeof item === "object") {
              items.push({
                type: "Object" as const,
                icon: field.summaryConfig?.icon || field.widgetOptions?.icon,
                label: `${
                  field.summaryConfig?.label ||
                  field.widgetOptions?.title ||
                  field.label ||
                  "Group"
                } ${index + 1}`,
                removable: removableMap[field.key || ""],
                removedData: field?.key
                  ? {
                      fieldKey: field.key,
                      index,
                    }
                  : undefined,
                items: field.fields?.length
                  ? (getListItems(
                      field.fields,
                      item,
                      displayValues,
                      services,
                      parentPath
                        ? `${parentPath}.${path}.${index}`
                        : `${path}.${index}`
                    ) as Item[])
                  : Object.keys(item).map((key) => ({
                      type: "Item" as const,
                      label: key,
                      value: JSON.stringify(item[key]),
                      removable: removableMap[field.key || ""],
                      removedData: field?.key
                        ? {
                            fieldKey: field.key,
                            index,
                          }
                        : undefined,
                    })),
              });
            } else if (item !== undefined && item !== null && item !== "") {
              items.push({
                type: "Item" as const,
                label: "",
                value: item as string | number | boolean,
                removable: removableMap[field.key || ""],
                removedData: field?.key
                  ? {
                      fieldKey: field.key,
                      index,
                    }
                  : undefined,
              });
            }
          });
        } else if (value && typeof value === "object") {
          items.push(
            field.fields?.length
              ? {
                  type: "Object" as const,
                  label:
                    field.summaryConfig?.label ||
                    field.label ||
                    field.widgetOptions?.title,
                  icon: field.summaryConfig?.icon || field.widgetOptions?.icon,
                  items: getListItems(
                    field.fields,
                    value,
                    displayValues,
                    services,
                    parentPath ? `${parentPath}.${path}` : path
                  ) as Item[],
                }
              : {
                  type: "Item" as const,
                  label:
                    field.summaryConfig?.label ||
                    field.label ||
                    field.widgetOptions?.title,
                  value: field.summaryConfig?.value || JSON.stringify(value),
                }
          );
        } else if (field.label) {
          items.push({
            type: "Item" as const,
            label: field.label,
            value: value as string | boolean | number,
          });
        }
      }

      return items;
    })
    .filter((items) => items.length)
    .flat();
}

function useSummary(
  formConfig: Layout,
  formData: Record<string, any>,
  displayValues: Record<string, any>,
  services: Services
) {
  if (formConfig.type === "tabs" || formConfig.type === "wizard") {
    let categories: {
      title: string;
      fields: Field[];
    }[] = [];

    if (formConfig.type === "tabs") {
      categories = formConfig.tabs || [];
    } else if (formConfig.type === "wizard") {
      categories = formConfig.steps || [];
    }

    const groups: Group[] = categories.map((group) => ({
      title: group.title,
      children: getListItems(
        group.fields,
        formData,
        displayValues,
        services,
        ""
      ),
    }));

    return {
      groups,
    };
  } else {
    return {
      items: getListItems(
        formConfig.fields,
        formData,
        displayValues,
        services,
        ""
      ),
    };
  }
}

export default useSummary;
