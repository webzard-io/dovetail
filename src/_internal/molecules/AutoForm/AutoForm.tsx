import React from "react";
import { Form } from "antd";
import { WidgetProps } from "./widget";
import SpecField from "./SpecField";
import { FormInstance } from "antd/lib/form";

export type AutoFormProps = WidgetProps;

const AutoForm = React.forwardRef<FormInstance, AutoFormProps>((props, ref) => {
  const { ...rest } = props;
  return (
    <Form ref={ref}>
      <SpecField {...rest} />
    </Form>
  );
});

export default AutoForm;
