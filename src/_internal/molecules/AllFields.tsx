import React, { useCallback } from "react";
import { Row } from "antd";
import { StringUnion } from "@sunmao-ui/shared";
import { Type, Static } from "@sinclair/typebox";
import { WidgetProps } from "./AutoForm/widget";
import { KitContext } from "../atoms/kit-context";
import { useContext, useEffect, useState } from "react";
import SpecField from "./AutoForm/SpecField";
import { resolveSubFields } from "./AutoForm/ObjectField";

export const OptionsSpec = Type.Object({});

type Props = WidgetProps<string, Static<typeof OptionsSpec>>;

const AllFields = (props: Props) => {
  return (
    <Row gutter={[24, 16]} style={{ margin: 0 }}>
      {resolveSubFields(props)}
    </Row>
  );
};

export default AllFields;
