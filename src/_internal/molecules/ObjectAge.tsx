import React from "react";
import { formatDuration } from "../utils/format-duration";

const _ObjectAge = React.forwardRef<
  HTMLSpanElement,
  {
    date: string;
    className?: string;
    template?: string;
  }
>((props, ref) => {
  const { className, date, template } = props;
  return (
    <span className={className} ref={ref}>
      {formatDuration(date, template)}
    </span>
  );
});

export default _ObjectAge;
