import React from "react";
import { Form, FormInstance } from "antd";
import { WidgetProps } from "./widget";
import SpecField from "./_SpecField";

const AutoForm = React.forwardRef<FormInstance, WidgetProps>((props, ref) => {
  const { ...rest } = props;
  return (
    <Form ref={ref}>
      <SpecField {...rest} />
    </Form>
  );
});

export default AutoForm;
