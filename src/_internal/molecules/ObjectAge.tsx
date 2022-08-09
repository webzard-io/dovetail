import React from "react";
import { formatDuration } from "../utils/date";

const _ObjectAge = React.forwardRef<
  HTMLSpanElement,
  {
    value: string;
    className?: string;
    template?: string;
  }
>((props, ref) => {
  const { className, value, template } = props;
  return (
    <span className={className} ref={ref}>
      {formatDuration(value, template)}
    </span>
  );
});

export default _ObjectAge;
