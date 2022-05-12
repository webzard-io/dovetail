import { css } from "@linaria/core";

export const IconWrapper = css`
  display: inline-flex;
  align-items: center;

  .icon-inner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .icon-inner + span,
  span + .icon-inner.suffix {
    margin-left: 4px;
  }
  &.is-rotate {
    img {
      animation: rotate 680ms linear infinite;
    }
  }
`;
