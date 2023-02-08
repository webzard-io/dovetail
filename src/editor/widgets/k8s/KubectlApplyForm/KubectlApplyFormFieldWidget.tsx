import { implementWidget, CategoryWidget } from "@sunmao-ui/editor-sdk";
import React, { useMemo } from "react";
import { omit } from "lodash";
import { Type } from "@sinclair/typebox";
import { getJsonSchemaByPath } from "src/_internal/utils/schema";
import { mergeWidgetOptionsByPath } from "../../../utils/schema";
import { JSONSchema7 } from "json-schema";
import { getFields } from "src/_internal/molecules/AutoForm/get-fields";

export default implementWidget<"kui/v1/KubectlApplyFormFieldWidget">({
  version: "kui/v1",
  metadata: {
    name: "KubectlApplyFormFieldWidget",
  },
  spec: {
    options: Type.Object({
      parentPath: Type.String(),
    }),
  },
})(function KubectlApplyFormFieldWidget(props) {
  const parentPath = props.spec.widgetOptions?.parentPath || "";
  const applyFormSchemas = useMemo<JSONSchema7[]>(() => {
    return (props.component.properties.formConfig as any)
      .schemas as JSONSchema7[];
  }, [props.component]);
  const spec = useMemo(() => {
    let spec: JSONSchema7 = props.spec;

    if (props.value.path) {
      const [index, ...path] = `${parentPath ? `${parentPath}.` : parentPath}${
        props.value.path
      }`.split(".");
      const applyFormSchema = getJsonSchemaByPath(
        applyFormSchemas[Number(index)],
        path.join(".")
      );
      const isArrayField = ["$i", "$add"].includes(path[path.length - 1]);
      const subPaths = applyFormSchema
        ? Object.keys(getFields(applyFormSchema)).map((subPath) => subPath)
        : [];

      if (applyFormSchema && applyFormSchema.type === "object") {
        spec = mergeWidgetOptionsByPath(spec, "fields.$i", {
          parentPath: props.value.path,
        });
        spec = mergeWidgetOptionsByPath(spec, "fields.$i.path", {
          paths: subPaths,
        });
        spec = mergeWidgetOptionsByPath(spec, "fields.$i.componentId", {
          parentPath: props.value.path,
        });

        return { ...spec, properties: omit(spec.properties, "subItem") };
      } else if (isArrayField && props.value.subItem) {
        return { ...spec, properties: omit(spec.properties, "fields") };
      }
    } else if (props.value.type === "layout") {
      const subPaths: string[] = applyFormSchemas
        .map((applyFormSchema, index) =>
          Object.keys(getFields(applyFormSchema)).map(
            (subPath) => `${index}.${subPath}`
          )
        )
        .flat();

      spec = mergeWidgetOptionsByPath(spec, "fields.$i", {
        parentPath: props.value.path,
      });
      spec = mergeWidgetOptionsByPath(spec, "fields.$i.path", {
        paths: subPaths,
      });
      spec = mergeWidgetOptionsByPath(spec, "fields.$i.componentId", {
        parentPath: props.value.path,
      });
      spec = mergeWidgetOptionsByPath(spec, "widget", {});

      return spec;
    }

    return {
      ...spec,
      properties: omit(spec.properties, ["fields", "subItem"]),
    };
  }, [props.spec, props.value, applyFormSchemas, parentPath]);

  return <CategoryWidget {...props} spec={spec}></CategoryWidget>;
});
