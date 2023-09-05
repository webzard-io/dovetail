import React from "react";
import { Type, Static } from "@sinclair/typebox";
import { useUIKit } from "@cloudtower/eagle";

export const OptionsSpec = Type.Object({
  color: Type.Optional(Type.String()),
});

type Props = {
  value: string | string[];
} & Static<typeof OptionsSpec>

const ObjectLabel = (props: Props) => {
  const kit = useUIKit();
  const { color } = props;
  
  return (
    <>
      {props.value instanceof Array ? (
        props.value.map((value) => <kit.tag key={value} color={color}>{value}</kit.tag>)
      ) : (
        <kit.tag color={color}>{props.value}</kit.tag>
      )}
    </>
  );
};

export default ObjectLabel;
