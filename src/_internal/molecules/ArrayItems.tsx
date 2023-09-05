import React, { useContext, useEffect, useCallback, useMemo } from "react";
import { kitContext } from "@cloudtower/eagle";
import { PlusAddCreateNew16BlueIcon, PlusAddCreateNew16GrayIcon, } from "@cloudtower/icons-react";
import { WidgetProps } from "./AutoForm/widget";
import { Type, Static } from "@sinclair/typebox";
import SpecField from "./AutoForm/SpecField";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { CloseOutlined } from "@ant-design/icons";
import Icon, {
  IconTypes,
} from "../atoms/themes/CloudTower/components/Icon/Icon";
import { generateFromSchema } from "../utils/schema";
import { JSONSchema7 } from "json-schema";
import { useTranslation } from "react-i18next";
import { cloneDeep, set } from "lodash";

const Wrapper = styled.div`
  display: flex;
  &:not(:first-child) {
    margin-top: 16px;
  }
`;
const HelperText = styled.div`
  margin: 4px 0 8px 0;
  font-size: 12px;
  line-height: 18px;
  color: rgba(44, 56, 82, 0.6);
`;
const CloseButtonStyle = css`
  &.ant-btn.ant-btn-sm {
    margin: 4px 0;
  }
`;
const AddedButtonStyle = css``;

export const COMMON_ARRAY_OPTIONS = {
  removable: Type.Optional(Type.Boolean({ title: "Removable" })),
  addable: Type.Optional(Type.Boolean({ title: "Addable" })),
  addedButtonText: Type.Optional(Type.String({ title: "Added button text" })),
  addedButtonIcon: Type.Optional(Type.String({ title: "Added button icon" })),
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
  useFirstAsDefaultValue: Type.Optional(Type.Boolean({
    title: "Use first as default value",
    description: "Is use the value of first item as the default value when adding the new item?"
  }))
}

export const OptionsSpec = Type.Object({
  ...COMMON_ARRAY_OPTIONS,
  helper: Type.Optional(Type.String({ title: "Helper" })),
});

type Props = WidgetProps<any, Static<typeof OptionsSpec>>;

const ArrayItems = (props: Props) => {
  const { t } = useTranslation();
  const {
    services,
    spec,
    field,
    value = [],
    displayValues,
    path,
    level,
    widgetOptions = {
      helper: "",
      removable: true,
      addable: true,
      addedButtonText: t("dovetail.add"),
      addedButtonIcon: "",
      maxLength: undefined,
      minLength: 0,
      useFirstAsDefaultValue: false,
    },
    onChange,
  } = props;
  const itemSpec = (
    Array.isArray(spec.items) ? spec.items[0] : spec.items
  ) as JSONSchema7;
  const kit = useContext(kitContext);
  const errorInfo = props.field?.error || props.error;
  const removable = useMemo(
    () => value.length > (widgetOptions?.minLength || 0),
    [value.length, widgetOptions.minLength]
  );

  const remove = useCallback(
    (index: number) => {
      onChange(
        value.filter((_: any, i: number) => i !== index),
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
    [remove, field]
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
  }, [services.event, handleRemoveEvent]);

  return (
    <>
      {value.map((itemValue: any, itemIndex: number) => (
        <Wrapper key={itemIndex}>
          <div style={{ flex: 1 }}>
            <SpecField
              {...props}
              field={undefined}
              item={field && "subItem" in field ? field.subItem : undefined}
              error={errorInfo instanceof Array ? errorInfo[itemIndex] : ""}
              widget={field?.subItem?.widget || "default"}
              value={itemValue}
              superiorKey={`${props.field?.key || ""}-${itemIndex}`}
              index={itemIndex}
              spec={{
                ...itemSpec,
                title: itemSpec.title,
              }}
              path={path.concat(`.${itemIndex}`)}
              level={level + 1}
              widgetOptions={field?.subItem?.widgetOptions || {}}
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
            />
          </div>
          {value.length > (widgetOptions?.minLength || 0) ? (
            <kit.button
              className={CloseButtonStyle}
              size="small"
              type="text"
              onClick={() => {
                remove(itemIndex);
              }}
            >
              <CloseOutlined />
            </kit.button>
          ) : null}
        </Wrapper>
      ))}
      {widgetOptions.helper && value.length ? (
        <HelperText>{widgetOptions.helper}</HelperText>
      ) : null}
      {widgetOptions.addable !== false &&
      value.length < (widgetOptions.maxLength || Number.MAX_SAFE_INTEGER) ? (
        <div style={{ marginTop: widgetOptions.helper ? 0 : "16px" }}>
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
                widgetOptions.useFirstAsDefaultValue ? props.field?.defaultValue?.[0] ?? generateFromSchema(itemSpec) : generateFromSchema(itemSpec);

              onChange(
                value.concat(
                  defaultValue && typeof defaultValue
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

export default ArrayItems;
