import React, { useState } from "react";
import { Radio } from "antd";
import SpecField from "./SpecField";
import { WidgetProps } from "./widget";

const _Field: React.FC<
  Omit<WidgetProps, "spec"> & {
    specs: NonNullable<WidgetProps["spec"]["anyOf"]>;
  }
> = (props) => {
  const { specs, value, level, path, onChange } = props;
  const [specIdx, setSpecIdx] = useState(0);
  const subSpec: WidgetProps["spec"] | boolean = specs[specIdx];

  if (typeof subSpec === "boolean") {
    return null;
  }

  return (
    <div>
      <Radio.Group
        value={specIdx}
        onChange={(evt) => setSpecIdx(parseInt(evt.target.value))}
        options={specs.map((s, idx) => ({
          label: typeof s === "boolean" ? "" : s.type,
          value: idx,
        }))}
      ></Radio.Group>
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
