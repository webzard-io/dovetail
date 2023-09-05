import { WidgetProps } from "./AutoForm/widget";
import Group from "./Group";
import { Type, Static } from "@sinclair/typebox";
import { kitContext } from "@cloudtower/eagle";
import { PlusAddCreateNew16BlueIcon, PlusAddCreateNew16GrayIcon, } from "@cloudtower/icons-react";
import React, { useContext, useEffect, useCallback } from "react";
import { css } from "@emotion/css";
import Icon, {
  IconTypes,
} from "../atoms/themes/CloudTower/components/Icon/Icon";
import { generateFromSchema } from "../utils/schema";
import { JSONSchema7 } from "json-schema";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";
import registry from "../../services/Registry";
import { StringUnion } from "@sunmao-ui/runtime";
import { set } from "lodash";
import { COMMON_ARRAY_OPTIONS } from "./ArrayItems";

const GroupStyle = css`
  &.ant-collapse {
    margin-bottom: 16px;
  }
`;
const AddedButtonStyle = css``;

export const OptionsSpec = Type.Object({
  ...COMMON_ARRAY_OPTIONS,
  title: Type.Optional(
    Type.String({
      title: "Title",
    })
  ),
  collapsible: Type.Optional(
    Type.Boolean({
      title: "Collapsible",
    })
  ),
  icon: Type.Optional(
    StringUnion([...registry.icons.keys()], { title: "Icon" })
  ),
});

type Props = WidgetProps<any[], Static<typeof OptionsSpec>>;

const ArrayGroups = (props: Props) => {
  const { t } = useTranslation();
  const kit = useContext(kitContext);
  const {
    services,
    field,
    value,
    displayValues,
    spec,
    path,
    level,
    widgetOptions = {
      title: "",
      removable: true,
      addable: true,
      addedButtonText: t("dovetail.add"),
      addedButtonIcon: "",
      maxLength: undefined,
      minLength: undefined,
      icon: "",
      collapsible: false,
      useFirstAsDefaultValue: false,
    },
    onChange,
  } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;
  const errorInfo = props.field?.error || props.error;

  const remove = useCallback(
    (index: number) => {
      onChange(
        value.filter((v, i) => i !== index),
        displayValues
      );
    },
    [onChange, value, displayValues]
  );
  const removeEventHandler = useCallback(
    (eventData: { fieldKey: string; index: number }) => {
      if (eventData.fieldKey === field?.key) {
        remove(eventData.index);
      }
    },
    [remove, field]
  );

  useEffect(() => {
    services.event.on("remove", removeEventHandler);

    return () => {
      services.event.off("remove", removeEventHandler);
    };
  }, [services, removeEventHandler]);
  useEffect(() => {
    if (field?.key) {
      const store = set(
        services.store,
        `summary.removableMap.${field.key || ""}`,
        value.length > (widgetOptions?.minLength || 0)
      );

      services.setStore({ ...store });
    }
  }, [value?.length, widgetOptions?.minLength, field?.key]);

  return (
    <>
      {(value || []).map((itemValue, itemIndex) => {
        return (
          <Group
            {...props}
            className={GroupStyle}
            key={itemIndex}
            value={itemValue}
            spec={itemSpec as JSONSchema7}
            superiorKey={`${props.field?.key}-${itemIndex}`}
            index={itemIndex}
            error={errorInfo instanceof Array ? errorInfo[itemIndex] : ""}
            widgetOptions={{
              ...widgetOptions,
              title: widgetOptions?.title
                ? `${widgetOptions?.title} ${itemIndex + 1}`
                : "",
              collapsible: widgetOptions.collapsible,
              icon: widgetOptions.icon,
            }}
            path={path.concat(`.${itemIndex}`)}
            level={level + 1}
            onRemove={
              value.length > (widgetOptions?.minLength || 0)
                ? () => remove(itemIndex)
                : undefined
            }
            onChange={(
              newItemValue: any,
              newDisplayValues: Record<string, any>,
              key?: string,
              dataPath?: string
            ) => {
              const newValue = [...value];

              newValue[itemIndex] = newItemValue;
              onChange(newValue, newDisplayValues, key, dataPath);
            }}
          ></Group>
        );
      })}
      {widgetOptions.addable !== false &&
        (value || []).length < (widgetOptions?.maxLength || Number.MAX_SAFE_INTEGER) ? (
        <div>
          {widgetOptions.addedButtonIcon ? (
            <Icon type={widgetOptions.addedButtonIcon as IconTypes}></Icon>
          ) : null}
          <kit.button
            prefixIcon={<PlusAddCreateNew16GrayIcon/>}
            hoverPrefixIcon={<PlusAddCreateNew16BlueIcon/>}
            className={AddedButtonStyle}
            size="small"
            onClick={() => {
              const defaultValue =
                widgetOptions.useFirstAsDefaultValue ? props.field?.defaultValue?.[0] ??
                  generateFromSchema(itemSpec as JSONSchema7) : generateFromSchema(itemSpec as JSONSchema7);

              onChange(
                value.concat(
                  defaultValue && typeof defaultValue === "object"
                    ? cloneDeep(defaultValue)
                    : defaultValue
                ),
                displayValues
              );
            }}
          >
            {widgetOptions.addedButtonText || t("dovetail.add")}
          </kit.button>
        </div>
      ) : null}
    </>
  );
};

export default ArrayGroups;
