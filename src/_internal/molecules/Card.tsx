import React, { useContext } from "react";
import { WidgetProps } from "./AutoForm/widget";
import { Type, Static } from "@sinclair/typebox";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";
import { Row } from "antd";
import { KitContext } from "../atoms/kit-context";
import { CloseOutlined } from "@ant-design/icons";
import { resolveSubFields } from "./AutoForm/ObjectField";

const CardWrapper = styled.div`
  background: rgba(237, 241, 250, 0.6);
  border: 1px solid rgba(211, 218, 235, 0.6);
  border-radius: 8px;
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  box-shadow: inset 0px -1px 0px rgba(211, 218, 235, 0.6);
`;
const CardTitle = styled.h5`
  display: flex;
  align-items: center;
  color: rgba(44, 56, 82, 0.6);
  font-weight: bold;
`;
const CardContentStyle = css`
  padding-bottom: 0;
  margin: 0;
`;

export const OptionsSpec = Type.Object({
  title: Type.String({
    title: "Title",
  }),
});

type Props = WidgetProps<any, Static<typeof OptionsSpec>> & {
  className?: string;
  onRemove?: () => void;
};

const Card = (props: Props) => {
  const kit = useContext(KitContext);
  const { widgetOptions, className, onRemove } = props;

  return (
    <CardWrapper className={className}>
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
      <Row className={CardContentStyle} gutter={[24, 16]} style={{ margin: 0 }}>
        {resolveSubFields(props)}
      </Row>
    </CardWrapper>
  );
};

export default Card;
