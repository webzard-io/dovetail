import { WidgetProps } from "./AutoForm/widget";
import Group from "./Group";
import { Type, Static } from "@sinclair/typebox";
import { KitContext } from "../atoms/kit-context";
import React, { useContext, useEffect, useCallback } from "react";
import { css, cx } from "@linaria/core";
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
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";

const GroupStyle = css`
  &.dovetail-ant-collapse {
    margin-bottom: 16px;
  }
`;
const AddedButtonStyle = css``;
const OrderStyle = css`
  display: inline-block;
  width: 20px;
  margin-right: 8px;
  color: rgba(44, 56, 82, 0.60);
`

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
  orderPosition: Type.Optional(
    StringUnion(["after", "before"]),
  ),
  itemKey: Type.Optional(
    Type.String()
  )
});

type Props = WidgetProps<any[], Static<typeof OptionsSpec>>;

const ArrayGroups = (props: Props) => {
  const { t } = useTranslation();
  const kit = useContext(KitContext);
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
      orderPosition: "after",
      itemKey: ""
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
            key={widgetOptions.itemKey ? itemValue[widgetOptions.itemKey] || itemIndex : itemIndex}
            value={itemValue}
            spec={itemSpec as JSONSchema7}
            superiorKey={`${props.field?.key}-${itemIndex}`}
            index={itemIndex}
            error={errorInfo instanceof Array ? errorInfo[itemIndex] : ""}
            widgetOptions={{
              ...widgetOptions,
              title: widgetOptions?.title
                ? widgetOptions.orderPosition === "before" ? (
                  <>
                    <span className={cx(OrderStyle, Typo.Label.l3_bold)}>{itemIndex + 1}</span>
                    <span>{widgetOptions.title}</span>
                  </>
                ) : `${widgetOptions?.title} ${itemIndex + 1}`
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
          <kit.Button
            prefixIcon="1-plus-add-create-new-16-secondary"
            className={AddedButtonStyle}
            type="ordinary"
            size="middle"
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
          </kit.Button>
        </div>
      ) : null}
    </>
  );
};

export default ArrayGroups;
