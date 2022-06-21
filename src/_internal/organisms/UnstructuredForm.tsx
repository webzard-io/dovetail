import React, { useState } from "react";
import AutoFrom, {
  AutoFormProps,
} from "../../_internal/molecules/AutoForm/AutoForm";
import { generateFromSchema } from "../../_internal/utils/generate-from-schema";

type UnstructuredFormProps = {
  spec: any;
  defaultValue?: any;
  renderer?: AutoFormProps["renderer"];
  onChange?: (value: any) => void;
};

const UnstructuredForm = React.forwardRef<
  HTMLDivElement,
  UnstructuredFormProps
>(({ spec, defaultValue, renderer, onChange }, ref) => {
  const [value, setValue] = useState(defaultValue || generateFromSchema(spec));

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <AutoFrom
        spec={spec}
        value={value}
        onChange={(newV) => {
          setValue(newV);
          onChange?.(newV);
        }}
        level={0}
        path=""
        renderer={renderer}
      />
    </div>
  );
});

export default UnstructuredForm;
