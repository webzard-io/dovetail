import { css } from "@linaria/core";

export const TagStyle = css`
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;

  &.expandable {
    cursor: pointer;
  }

  &.expanded {
    white-space: normal;
    overflow: unset;
  }
`;
