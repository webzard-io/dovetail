import React, { useRef } from "react";
import { Form } from "antd";
import { WidgetProps } from "./widget";
import SpecField from "./SpecField";
import { FormInstance } from "antd/lib/form";

export type AutoFormProps = Omit<WidgetProps, "stepElsRef">;

const AutoForm = React.forwardRef<FormInstance, AutoFormProps>((props, ref) => {
  const { layout } = props;
  const stepElsRef = useRef<WidgetProps["stepElsRef"]>({});

  return (
    <Form ref={ref}>
      {layout?.steps &&
        layout.steps.map((__, stepIdx) => {
          return (
            <div
              key={stepIdx}
              ref={(el) => {
                stepElsRef.current[stepIdx] = el;
              }}
            ></div>
          );
        })}
      <SpecField {...props} stepElsRef={stepElsRef.current} />
    </Form>
  );
});

export default AutoForm;
