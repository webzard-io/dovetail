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

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;
const CloseButtonStyle = css``;
const AddedButtonStyle = css`
  margin-bottom: 16px;
`;

export const OptionsSpec = Type.Object({
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
});

type Props = WidgetProps<any, Static<typeof OptionsSpec>>;

const ArrayItems = (props: Props) => {
  const {
    spec,
    value = [],
    path,
    level,
    widgetOptions = {
      removable: true,
      addable: true,
      addedButtonText: "添加",
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
              path={path.concat(`[${itemIndex}]`)}
              level={level + 1}
              widgetOptions={{}}
              onChange={(newItemValue: any, key) => {
                const newValue = [...value];
                newValue[itemIndex] = newItemValue;
                onChange(newValue, key);
              }}
            />
          </div>
          {value.length > (widgetOptions?.minLength || 0) ? (
            <kit.Button
              className={CloseButtonStyle}
              size="small"
              type="text"
              onClick={() => {
                onChange(value.filter((_: any, i: number) => i !== itemIndex));
              }}
            >
              <CloseOutlined />
            </kit.Button>
          ) : null}
        </Wrapper>
      ))}
      {widgetOptions.addable !== false &&
      value.length < (widgetOptions.maxLength || Number.MAX_SAFE_INTEGER) ? (
        <div>
          {widgetOptions.addedButtonIcon ? (
            <Icon type={widgetOptions.addedButtonIcon as IconTypes}></Icon>
          ) : null}
          <kit.Button
            className={AddedButtonStyle}
            size="medium"
            onClick={() => {
              onChange(
                props.field?.defaultValue?.[0] ??
                  value.concat(generateFromSchema(itemSpec))
              );
            }}
          >
            {widgetOptions.addedButtonText || "添加"}
          </kit.Button>
        </div>
      ) : null}
    </>
  );
};

export default ArrayItems;
