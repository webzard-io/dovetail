import React, { useContext } from "react";
import { WidgetProps } from "./AutoForm/widget";
import { Type, Static } from "@sinclair/typebox";
import styled from "@emotion/styled";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";
import { KitContext } from "../atoms/kit-context";
import { CloseOutlined } from "@ant-design/icons";
import { resolveSubFields } from "./AutoForm/ObjectField";

const CardWrapper = styled.div`
  background: rgba(237, 241, 250, 0.6);
  border: 1px solid rgba(211, 218, 235, 0.6);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CardTitle = styled.h5`
  color: rgba(44, 56, 82, 0.6);
`;

export const OptionsSpec = Type.Object({
  title: Type.String({
    title: "Title",
  }),
});

type Props = WidgetProps<any, Static<typeof OptionsSpec>> & {
  onRemove?: () => void;
};

const Card = (props: Props) => {
  const kit = useContext(KitContext);
  const { widgetOptions, onRemove } = props;

  return (
    <CardWrapper>
      {widgetOptions?.title || onRemove ? (
        <CardHeader>
          <CardTitle className={Typo.Label.l2_regular}>
            {widgetOptions?.title}
          </CardTitle>
          {onRemove ? (
            <span>
              <kit.Button size="small" type="text" onClick={onRemove}>
                <CloseOutlined />
              </kit.Button>
            </span>
          ) : null}
        </CardHeader>
      ) : null}
      <div>{resolveSubFields(props)}</div>
    </CardWrapper>
  );
};

export default Card;
