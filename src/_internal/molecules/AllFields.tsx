import React from "react";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { resolveSubFields } from "./AutoForm/ObjectField";
import { useUIKit } from "@cloudtower/eagle";

export const OptionsSpec = Type.Object({});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const AllFields = (props: Props) => {
  const kit = useUIKit();

  return (
    <kit.row gutter={[24, 16]} style={{ margin: 0 }}>
      {resolveSubFields(props)}
    </kit.row>
  );
};

export default AllFields;
