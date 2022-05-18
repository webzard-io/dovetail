import React from "react";
import { Form, FormInstance } from "antd";
import { WidgetProps } from "./widget";
import SpecField from "./_SpecField";

type AutoFormProps = WidgetProps;

const AutoForm = React.forwardRef<FormInstance, AutoFormProps>((props, ref) => {
  const { ...rest } = props;
  return (
    <Form ref={ref}>
      <SpecField {...rest} />
    </Form>
  );
});

export default AutoForm;
