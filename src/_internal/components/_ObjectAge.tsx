import React from "react";
import { formatDuration } from "../utils/format-duration";

const _ObjectAge = React.forwardRef<
  HTMLSpanElement,
  {
    date: string;
    className?: string;
  }
>((props, ref) => {
  return (
    <span className={props.className} ref={ref}>
      {formatDuration(props.date)}
    </span>
  );
});

export default _ObjectAge;
