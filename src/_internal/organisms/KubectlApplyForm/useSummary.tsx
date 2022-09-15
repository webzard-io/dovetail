import type {
  Group,
  Item,
  Object,
  SubHeading,
  Label,
} from "../../atoms/themes/CloudTower/components/SummaryList";
import { Layout, Field } from "./type";
import { get } from "lodash";

function getValueByPath(formData: Record<string, any>, path: string) {
  if (path.includes("$add") || path.includes("$i")) {
    if (path.includes(".$i.")) {
      // has sub path
      const [arrayPath, subPath] = path.split(".$i.");
      const array = get(formData, arrayPath);

      return array.map((item: any) => getValueByPath(item, subPath));
    }
  } else {
    return get(formData, path);
  }
}

function getListItems(
  fields: Field[],
  formData: Record<string, any>
): (Item | Object | SubHeading | Label)[] {
  return fields
    .map((field) => {
      const items: (Item | Object | SubHeading | Label)[] = [];

      if (field.sectionTitle) {
        items.push({
          type: "SubHeading" as const,
          title: field.sectionTitle,
        });
      }

      const path = field.path.replace(/(.\$add)|(.\$i)/g, (substring)=> {
        if (substring === '.$add') {
          return ''; 
        } else {
          return '.0';
        }
      });
      const value = getValueByPath(formData, path);

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
              type: "Label" as const,
              label: field.widgetOptions?.title + ' ' + (index + 1),
            });
            items.push({
              type: "Object" as const,
              icon: field.widgetOptions?.icon,
              label: field.label,
              items: field.fields?.length
                ? (getListItems(field.fields, item) as Item[])
                : Object.keys(item).map((key) => ({
                    type: "Item" as const,
                    label: key,
                    value: JSON.stringify(item[key]),
                  })),
            });
          } else {
            items.push({
              type: "Item" as const,
              label: "",
              value: item,
            });
          }
        });
      } else if (value && typeof value === "object") {
        items.push({
          type: "Object" as const,
          label: field.label || field.widgetOptions?.title,
          icon: field.widgetOptions?.icon,
          items: field.fields?.length
            ? (getListItems(field.fields, value) as Item[])
            : Object.keys(value).map((key) => ({
                type: "Item" as const,
                label: key,
                value: JSON.stringify(value[key]),
              })),
        });
      } else if (field.label) {
        items.push({
          type: "Item" as const,
          label: field.label,
          value,
        });
      }

      return items;
    })
    .flat();
}

function useSummary(formConfig: Layout, formData: Record<string, any>) {
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
      children: getListItems(group.fields, formData),
    }));

    return {
      groups,
    };
  } else {
    return {
      items: getListItems(formConfig.fields, formData),
    };
  }
}

export default useSummary;
