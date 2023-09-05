import { css } from "@linaria/core";

export const Sidebar = css`
  .ant-drawer-content-wrapper {
    transition: none;
  }

  &.ant-drawer-open .ant-drawer-content-wrapper {
    border-left: 1px solid $separators-opaque-light;
    box-shadow: none;
    transition: all 500ms cubic-bezier(0, 1, 0, 1);
  }
  .ant-drawer-body {
    padding: 0;
    height: 100%;
    background: $backgrounds-light-grouped;
  }
  .drawer-content-inner {
    height: 100%;
    position: relative;
    padding: 24px;

    .close-icon {
      position: absolute;
      top: 26px;
      right: 26px;
      font-size: 18px;
      color: $gray-80;
      cursor: pointer;
      transition: opacity 320ms 80ms;

      &:hover {
        opacity: 0.8;
      }
    }
  }
  // override table style of the sidebar
  .ant-table {
    background: $backgrounds-light-grouped;
    th {
      background: $backgrounds-light-grouped !important;
    }
    td {
      background: $backgrounds-light-grouped !important;
      border-top-color: $backgrounds-light-grouped !important;
      border-bottom: 1px solid $strokes-light-trans-2 !important;

      &.cell__action_ > div {
        background: $backgrounds-light-grouped !important;
      }
      &:last-child {
        border-radius: 0 8px 8px 0 !important;
      }
    }
    .ant-table-row:hover td {
      background: $fills-trans-secondary-light !important;
      border-bottom-color: $backgrounds-light-grouped !important;
    }
  }
`;
