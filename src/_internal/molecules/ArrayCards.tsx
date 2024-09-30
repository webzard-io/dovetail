import { WidgetProps } from "./AutoForm/widget";
import Card from "./Card";
import { Type, Static } from "@sinclair/typebox";
import { KitContext } from "../atoms/kit-context";
import React, { useContext, useCallback, useEffect, useMemo } from "react";
import { css } from "@linaria/core";
import Icon, {
  IconTypes,
} from "../atoms/themes/CloudTower/components/Icon/Icon";
import { generateFromSchema } from "../utils/schema";
import { JSONSchema7 } from "json-schema";
import { useTranslation } from "react-i18next";
import { cloneDeep, set } from "lodash";
import { defineId, ID_PROP } from "./../utils/id";

const CardStyle = css`
  margin-bottom: 16px;
`;
const AddedButtonStyle = css``;

export const OptionsSpec = Type.Object({
  title: Type.String({
    title: "Title",
  }),
  removable: Type.Boolean({ title: "Removable" }),
  addable: Type.Boolean({ title: "Addable" }),
  addedButtonText: Type.String({ title: "Added button text" }),
  addedButtonIcon: Type.String({ title: "Added button icon" }),
  maxLength: Type.Optional(
    Type.Number({
      title: "Max length",
    })
  ),
  minLength: Type.Optional(
    Type.Number({
      title: "Min Length",
    })
  ),
});

type Props = WidgetProps<any[], Static<typeof OptionsSpec>>;

const ArrayCards = (props: Props) => {
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
    },
    onChange,
  } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;
  const errorInfo = props.field?.error || props.error;
  const removable = useMemo(
    () => value.length > (widgetOptions?.minLength || 0) && widgetOptions.removable !== false,
    [value.length, widgetOptions?.minLength]
  );

  const remove = useCallback(
    (index: number) => {
      onChange(
        value.filter((v, i) => i !== index),
        displayValues
      );
    },
    [onChange, value, displayValues]
  );
  const handleRemoveEvent = useCallback(
    (eventData: { fieldKey: string; index: number }) => {
      if (field?.key === eventData.fieldKey) {
        remove(eventData.index);
      }
    },
    [field?.key, remove]
  );

  useEffect(() => {
    const store = set(
      services.store,
      `summary.removableMap.${field?.key || ""}`,
      removable
    );

    services.setStore({ ...store });
  }, [field?.key, removable]);
  useEffect(() => {
    services.event.on("remove", handleRemoveEvent);

    return () => {
      services.event.off("remove", handleRemoveEvent);
    };
  }, [handleRemoveEvent, services.event]);

  return (
    <>
      {(value || []).map((itemValue, itemIndex) => {
        defineId(itemValue);

        return (
          <Card
            {...props}
            className={CardStyle}
            key={itemIndex}
            value={itemValue}
            spec={itemSpec as JSONSchema7}
            superiorKey={`${props.field?.key}-${itemIndex}`}
            index={itemIndex}
            id={itemValue[ID_PROP]}
            error={errorInfo instanceof Array ? errorInfo[itemIndex] : ""}
            widgetOptions={{
              ...widgetOptions,
              title: widgetOptions?.title
                ? `${widgetOptions?.title} ${itemIndex + 1}`
                : "",
            }}
            path={path.concat(`.${itemIndex}`)}
            level={level + 1}
            onRemove={
              removable
                ? () => {
                  remove(itemIndex);
                }
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
          ></Card>
        );
      })}
      {widgetOptions.addable !== false &&
        value.length < (widgetOptions?.maxLength || Number.MAX_SAFE_INTEGER) ? (
        <div>
          {widgetOptions.addedButtonIcon ? (
            <Icon type={widgetOptions.addedButtonIcon as IconTypes}></Icon>
          ) : null}
          <kit.Button
            prefixIcon="1-plus-add-create-new-16-secondary"
            type="ordinary"
            className={AddedButtonStyle}
            size="middle"
            onClick={() => {
              const defaultValue =
                props.field?.defaultValue?.[0] ??
                generateFromSchema(itemSpec as JSONSchema7);

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

export default ArrayCards;
