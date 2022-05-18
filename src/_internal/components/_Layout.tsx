import { css } from "@emotion/css";

export const Row = css`
  display: flex;

  > label {
    width: 30%;
  }

  .value {
    width: 70%;
  }

  padding: 8px 0;
  &:not(:nth-child(1)) {
    border-top: 1px solid rgba(225, 230, 241, 0.6);
  }
`;
