import {
  implementWidget,
  ObjectField,
} from "@sunmao-ui/editor-sdk";
import React, { useMemo } from "react";
import { omit } from "lodash";
import { Type } from "@sinclair/typebox";
import {
  getJsonSchemaByPath,
  mergeWidgetOptionsByPath,
} from "../../../utils/schema";
import { JSONSchema7 } from 'json-schema';
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
  const applyFormSchemas = useMemo(() => {
    return (props.component.properties.formConfig as any).schemas;
  }, [props.component]);
  const spec = useMemo(() => {
    let spec: JSONSchema7 = props.spec;

    if (props.value.path) {
      const [index, ...path] = `${parentPath ? `${parentPath}.` : parentPath}${
        props.value.path
      }`.split(".");
      const applyFormSchema = getJsonSchemaByPath(
        applyFormSchemas[index],
        path.join(".")
      );
      const isArraySchema =
        applyFormSchema?.type === "array" &&
        (applyFormSchema?.items as JSONSchema7)?.type === "object";

      if (
        applyFormSchema &&
        (applyFormSchema.type === "object" || isArraySchema)
      ) {
        const paths = Object.keys(getFields(applyFormSchema)).map((subPath) =>
          isArraySchema ? subPath.split(".").slice(1).join(".") : subPath
        );

        spec = mergeWidgetOptionsByPath(spec, "fields.$i", {
          parentPath: props.value.path,
        });
        spec = mergeWidgetOptionsByPath(spec, "fields.$i.path", {
          paths,
        });
        spec = mergeWidgetOptionsByPath(spec, "fields.$i.componentId", {
          parentPath: props.value.path,
        });

        return spec;
      }
    }

    return {
      ...spec,
      properties: omit(spec.properties, "fields"),
    };
  }, [props.spec, props.value, applyFormSchemas]);

  return <ObjectField {...props} spec={spec}></ObjectField>;
});
