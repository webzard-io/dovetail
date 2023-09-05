import React, { useState } from "react";
import SpecField from "./SpecField";
import { WidgetProps } from "./widget";
import { useUIKit } from "@cloudtower/eagle";

const _Field: React.FC<
  Omit<WidgetProps, "spec"> & {
    specs: NonNullable<WidgetProps["spec"]["anyOf"]>;
  }
> = (props) => {
  const kit = useUIKit();
  const { specs, value, level, path, onChange } = props;
  const [specIdx, setSpecIdx] = useState(0);
  const subSpec: WidgetProps["spec"] | boolean = specs[specIdx];

  if (typeof subSpec === "boolean") {
    return null;
  }

  return (
    <div>
      <kit.radioGroup
        value={specIdx}
        onChange={(evt) => setSpecIdx(parseInt(evt.target.value))}
        options={specs.map((s, idx) => ({
          label: typeof s === "boolean" ? "" : s.type,
          value: idx,
        }))}
      ></kit.radioGroup>
      <SpecField
        {...props}
        spec={subSpec}
        path={path}
        level={level}
        value={value}
        onChange={(newValue, newDisplayValues) =>
          onChange(newValue, newDisplayValues)
        }
      />
    </div>
  );
};

export const MultiSpecField: React.FC<WidgetProps> = (props) => {
  const { spec, value, path, level, onChange } = props;

  if (spec.anyOf) {
    return (
      <_Field
        {...props}
        value={value}
        path={path}
        level={level}
        specs={spec.anyOf}
        onChange={onChange}
      />
    );
  }

  if (spec.oneOf) {
    return (
      <_Field
        {...props}
        value={value}
        path={path}
        level={level}
        specs={spec.oneOf}
        onChange={onChange}
      />
    );
  }

  return null;
};

export default MultiSpecField;
