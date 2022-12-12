import React, { useContext } from "react";
import { KitContext } from "../atoms/kit-context";
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
import { cloneDeep } from "lodash";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  &:not(:first-child) {
    margin-top: 16px;
  }
`;
const HelperText = styled.div`
  margin: 8px 0;
  color: rgba(44, 56, 82, 0.6);
`;
const CloseButtonStyle = css``;
const AddedButtonStyle = css``;

export const OptionsSpec = Type.Object({
  removable: Type.Optional(Type.Boolean({ title: "Removable" })),
  addable: Type.Optional(Type.Boolean({ title: "Addable" })),
  addedButtonText: Type.Optional(Type.String({ title: "Added button text" })),
  addedButtonIcon: Type.Optional(Type.String({ title: "Added button icon" })),
  helper: Type.Optional(Type.String({ title: "Helper" })),
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

type Props = WidgetProps<any, Static<typeof OptionsSpec>>;

const ArrayItems = (props: Props) => {
  const { t } = useTranslation();
  const {
    spec,
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
    },
    onChange,
  } = props;
  const itemSpec = (
    Array.isArray(spec.items) ? spec.items[0] : spec.items
  ) as JSONSchema7;
  const kit = useContext(KitContext);
  const errorInfo = props.field?.error || props.error;

  return (
    <>
      {value.map((itemValue: any, itemIndex: number) => (
        <Wrapper key={itemIndex}>
          <div style={{ flex: 1 }}>
            <SpecField
              {...props}
              field={undefined}
              error={errorInfo instanceof Array ? errorInfo[itemIndex] : ""}
              widget="default"
              value={itemValue}
              subKey={`${props.field?.key}-${itemIndex}`}
              index={itemIndex}
              spec={{
                ...itemSpec,
                title: itemSpec.title,
              }}
              path={path.concat(`.${itemIndex}`)}
              level={level + 1}
              widgetOptions={{}}
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
          ;
          {value.length > (widgetOptions?.minLength || 0) ? (
            <kit.Button
              className={CloseButtonStyle}
              size="small"
              type="text"
              onClick={() => {
                onChange(
                  value.filter((_: any, i: number) => i !== itemIndex),
                  displayValues
                );
              }}
            >
              <CloseOutlined />
            </kit.Button>
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
          <kit.Button
            prefixIcon="1-plus-add-create-new-16-gray"
            hoverPrefixIcon="1-plus-add-create-new-16-blue"
            className={AddedButtonStyle}
            size="small"
            onClick={() => {
              const defaultValue =
                props.field?.defaultValue?.[0] ?? generateFromSchema(itemSpec);

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
          </kit.Button>
        </div>
      ) : null}
    </>
  );
};

export default ArrayItems;
