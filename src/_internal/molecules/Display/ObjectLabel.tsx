import React from "react";
import { Tag } from "antd";
import { Type, Static } from '@sinclair/typebox';

export const OptionsSpec = Type.Object({
  color: Type.Optional(Type.String()),
});

type Props = {
  value: string | string[];
} & Static<typeof OptionsSpec>

const ObjectLabel = (props: Props) => {
  const { color } = props;
  
  return (
    <>
      {props.value instanceof Array ? (
        props.value.map((value) => <Tag key={value} color={color}>{value}</Tag>)
      ) : (
        <Tag color={color}>{props.value}</Tag>
      )}
    </>
  );
};

export default ObjectLabel;
