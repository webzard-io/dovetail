import { WidgetProps } from "./AutoForm/widget";
import Card from "./Card";
import { Type, Static } from "@sinclair/typebox";
import { KitContext } from "../atoms/kit-context";
import { useContext } from "react";
import { css } from "@emotion/css";
import Icon, {
  IconTypes,
} from "../atoms/themes/CloudTower/components/Icon/Icon";
import { generateFromSchema } from "../utils/schema";
import { JSONSchema7 } from "json-schema";

const AddedButtonStyle = css`
  margin-bottom: 16px;
`;

export const OptionsSpec = Type.Object({
  title: Type.String({
    title: "Title",
  }),
  removable: Type.Boolean({ title: "Removable" }),
  addable: Type.Boolean({ title: "Addable" }),
  addedButtonText: Type.String({ title: "Added button text" }),
  addedButtonIcon: Type.String({ title: "Added button icon" }),
});

type Props = WidgetProps<any[], Static<typeof OptionsSpec>>;

const ArrayCards = (props: Props) => {
  const kit = useContext(KitContext);
  const {
    value,
    spec,
    path,
    level,
    widgetOptions = {
      title: "",
      removable: true,
      addable: true,
      addedButtonText: "添加",
      addedButtonIcon: "",
    },
    onChange,
  } = props;
  const itemSpec = Array.isArray(spec.items) ? spec.items[0] : spec.items;

  return (
    <>
      {(value || []).map((itemValue, itemIndex) => {
        return (
          <Card
            {...props}
            key={itemIndex}
            value={itemValue}
            spec={itemSpec as JSONSchema7}
            widgetOptions={{
              ...widgetOptions,
              title: widgetOptions?.title
                ? `${widgetOptions?.title} ${itemIndex + 1}`
                : "",
            }}
            path={path.concat(`[${itemIndex}]`)}
            level={level + 1}
            onRemove={() => {
              onChange(value.filter((v, i) => i !== itemIndex));
            }}
            onChange={(newItemValue: any) => {
              const newValue = [...value];

              newValue[itemIndex] = newItemValue;
              onChange(newValue);
            }}
          ></Card>
        );
      })}
      {widgetOptions.addable !== false ? (
        <div>
          {widgetOptions.addedButtonIcon ? (
            <Icon type={widgetOptions.addedButtonIcon as IconTypes}></Icon>
          ) : null}
          <kit.Button
            className={AddedButtonStyle}
            size="medium"
            onClick={() => {
              onChange(
                value.concat(generateFromSchema(itemSpec as JSONSchema7))
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

export default ArrayCards;
