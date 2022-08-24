import React, { useContext } from "react";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { resolveSubFields } from "./AutoForm/ObjectField";
import styled from "@emotion/styled";
import { KitContext } from "../atoms/kit-context";
import { CloseOutlined } from "@ant-design/icons";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";

const GroupWrapper = styled.div`
  border: 1px solid #e4e9f2;
  border-radius: 8px;
  margin-bottom: 16px;
`;
const GroupHeader = styled.div`
  height: 44px;
  line-height: 44px;
  padding: 0 12px;
  background: rgba(225, 230, 241, 0.6);
  display: flex;
  justify-content: space-between;
`;
const GroupTitle = styled.h5`
  color: rgba(44, 56, 82, 0.6);
`;
const GroupBody = styled.div`
  padding: 12px;
`;

export const OptionsSpec = Type.Object({
  title: Type.Optional(Type.String({
    title: "Title",
  })),
});

type GroupProps = WidgetProps<Record<string, any>, Static<typeof OptionsSpec>> & {
  onRemove?: () => void;
};

const Group = (props: GroupProps) => {
  const { widgetOptions, onRemove } = props;
  const kit = useContext(KitContext);

  return (
    <GroupWrapper>
      <GroupHeader>
        <GroupTitle className={Typo.Label.l2_regular}>{widgetOptions?.title}</GroupTitle>
        {onRemove ? (
          <span>
            <kit.Button size="small" type="text" onClick={onRemove}>
              <CloseOutlined />
            </kit.Button>
          </span>
        ) : null}
      </GroupHeader>
      <GroupBody>{resolveSubFields(props)}</GroupBody>
    </GroupWrapper>
  );
};

export default Group;
