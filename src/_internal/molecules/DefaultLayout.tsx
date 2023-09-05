import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { resolveSubFields } from "./AutoForm/ObjectField";
import React from "react";
import { css } from "@emotion/css";
import { useUIKit } from "@cloudtower/eagle";

const GroupBodyStyle = css`
  padding-bottom: 0;
  margin: 0;
`;

export const OptionsSpec = Type.Object({});

type DefaultLayoutProps = WidgetProps<
  Record<string, any>,
  Static<typeof OptionsSpec>
>;

const DefaultLayout = (props: DefaultLayoutProps) => {
  const kit = useUIKit();

  return (
    <kit.row className={GroupBodyStyle} gutter={[24, 16]} style={{ margin: "-8px -12px" }}>
      {resolveSubFields(props)}
    </kit.row>
  );
};

export default DefaultLayout;
