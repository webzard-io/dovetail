import { forwardRef } from "react";
import { cx } from "@linaria/core";
import { LoadingStyle } from "./Loading.style";

const Loading = forwardRef<HTMLDivElement, {}>((_, ref) => (
  <div ref={ref} className={cx("loading", LoadingStyle)}>
    <div className="loading__sugar"></div>
    <div className="loading__sugar"></div>
    <div className="loading__sugar"></div>
    <div className="loading__sugar"></div>
    <div className="loading__sugar"></div>
    <div className="loading__sugar"></div>
    <div className="loading__sugar"></div>
  </div>
));

export default Loading;
