import { css } from "@linaria/core";

export const TableLoadingStyle = css`
  height: 100%;
  .table-loading-item {
    padding: 12px 4px;
    border-bottom: 1px solid rgba($gray-50, 0.18);
    display: flex;

    > * {
      height: 16px;
      margin: 4px;
      background: rgba($gray-50, 0.18);
      border-radius: 2px;
    }
    .checkbox-loading {
      width: 16px;
    }
    .td-loading {
      flex: 1;
    }
  }

  :nth-child(1) {
    padding: 8px 4px;
    > * {
      background: rgba($gray-70, 0.18);
    }
  }
  :nth-child(1) {
    > * {
      background: rgba($gray-60, 0.18);
    }
  }
`;
