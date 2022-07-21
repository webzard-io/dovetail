import React from "react";

type KubectlGetDetailProps = {};

const KubectlGetDetail = React.forwardRef<
  HTMLDivElement,
  KubectlGetDetailProps
>((props, ref) => {
  return <div ref={ref}>kdd</div>;
});

export default KubectlGetDetail;
