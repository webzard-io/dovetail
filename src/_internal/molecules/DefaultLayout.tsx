import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { resolveSubFields } from "./AutoForm/ObjectField";
import React from "react";

export const OptionsSpec = Type.Object({});

type DefaultLayoutProps = WidgetProps<
  Record<string, any>,
  Static<typeof OptionsSpec>
>;

const DefaultLayout = (props: DefaultLayoutProps) => {
  return <div>{resolveSubFields(props)}</div>;
};

export default DefaultLayout;
