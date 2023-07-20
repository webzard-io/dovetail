import { css } from "@linaria/core";
import React from "react";

const Style = css`
  width: 1px;
  height: 16px;
  border-radius: 1px;
  background: rgba(172, 186, 211, 0.6);
`;

export const Seperator: React.FC = () => {
  return <div className={Style} />;
};
