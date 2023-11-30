import { css } from "@linaria/core";

export const TableContainerStyle = css`
  height: 100%;
`;

export const TableStyle = css`
  height: 100%;

  &.empty-table .dovetail-ant-table-content {
    overflow: visible !important;
    height: 100%;

    .dovetail-ant-table-tbody .dovetail-ant-table-placeholder td {
      height: 100%;
    }

    table {
      width: 100% !important;
      height: 100%;
      .dovetail-ant-table-placeholder .dovetail-ant-table-expanded-row-fixed {
        padding: 15px 0;
      }
    }

    table thead.dovetail-ant-table-thead {
      display: none;
    }
  }

  .active-row td:nth-child(1) {
    font-weight: 700;
  }
  &.has-selection .active-row td:nth-child(2) {
    font-weight: 700;
  }

  .dovetail-ant-spin-nested-loading {
    height: 100%;

    .dovetail-ant-spin-container {
      height: 100%;
      overflow: visible;
    }
    .dovetail-ant-spin {
      max-height: none;
    }
  }

  &.table-init-loading .dovetail-ant-spin-blur {
    thead,
    tbody {
      display: none;
    }
  }

  td.dovetail-ant-table-column-sort {
    background: transparent;
  }

  td.dovetail-ant-table-cell-fix-left,
  td.dovetail-ant-table-cell-fix-right {
    background: #fff;
    padding: 0 !important;
    .dovetail-ant-table-cell-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 8px;
    }
  }

  .dovetail-ant-table-container {
    height: 100%;
    &::before,
    &::after {
      box-shadow: none !important;
    }
  }

  .dovetail-ant-table {
    border-radius: 0px;
    border-left: none;
    border-right: none;
    border-bottom: none;
    height: 100%;
    font-size: 12px;
    background: transparent;

    .dovetail-ant-table-header {
      position: relative;
      z-index: 3;
      border-bottom: 1px solid $strokes-light-trans-2;
      margin-bottom: -1px;
    }

    .time-wrapper .data,
    .value {
      color: $text-primary-light;
    }

    .time-wrapper .time,
    .unit {
      color: $text-secondary-light;
    }

    .dovetail-ant-table-selection {
      text-align: center;
    }

    .dovetail-ant-table-tbody > tr.dovetail-ant-table-row-selected td {
      background: $white;
    }

    .anticon-setting {
      cursor: pointer;
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
    }

    &.dovetail-ant-table-ping-left {
      .dovetail-ant-table-cell-fix-left-last::after {
        box-shadow: none;
        width: 1px;
        background: rgba(213, 219, 227, 0.6);
      }
    }

    &.dovetail-ant-table-ping-right {
      .dovetail-ant-table-cell-fix-right-first::after {
        box-shadow: none;
        width: 1px;
        background: rgba(213, 219, 227, 0.6);
      }
    }

    .dovetail-ant-table-tbody {
      position: relative;
      .dovetail-ant-table-row {
        td {
          border-top: 1px solid $strokes-light-trans-2;
          border-bottom: 1px solid white;
          height: 40px;
          vertical-align: middle;
          transition: background 0ms;
          color: $gray-120;

          &.header-hover {
            background: $fills-light-opaque-1;
            border-bottom-color: $fills-light-opaque-1;
          }

          .dovetail-ant-btn-link {
            height: 16px;
            line-height: 16px;
            color: $gray-120;
            font-size: 12px;
            text-align: left;
            transition: none;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
              color: $blue;
            }
          }
        }

        &:hover {
          & + tr td {
            border-top-color: transparent;
          }
          td {
            background: $fills-trans-secondary-light;
            border-color: transparent transparent white;

            &:first-child {
              border-radius: 8px 0 0 8px;
              &::before {
                content: "";
                width: 4px;
                top: -1px;
                bottom: -1px;
                background: white;
              }
            }
            &:last-child {
              border-radius: 0 8px 8px 0;
            }
            &:last-child.cell__action_ {
              border-radius: 0;
              background: white;
              border-top: none;

              > * {
                border-top: 1px solid transparent;
                border-radius: 0 8px 8px 0;
                background: $fills-trans-secondary-light;
              }
            }
            &.dovetail-ant-table-cell-fix-right {
              background: white;
              .dovetail-ant-table-cell-content {
                display: flex;
                align-items: center;
                height: 100%;
                background: $fills-trans-secondary-light;
              }
            }

            &.dovetail-ant-table-cell-fix-left {
              background: white;
              .dovetail-ant-table-cell-content {
                display: flex;
                align-items: center;
                height: 100%;
                background: $fills-trans-secondary-light;
              }
            }
          }
        }

        &:last-child td {
          border-bottom: 1px solid $strokes-light-trans-2;
        }

        &.active-row {
          box-shadow: inset 0px 0px 0 2px $blue-a10;
          border-radius: 8px;

          & + tr td {
            border-top-color: white;
          }
          td {
            background: $blue-a10;
            border-bottom-color: transparent;
            border-top-color: transparent;

            &:first-child {
              border-radius: 8px 0 0 8px;
            }
            &:last-child {
              border-radius: 0 8px 8px 0;
            }
            &:hover {
              background: $blue-a10;
            }
          }
        }
      }
    }

    .dovetail-ant-table-thead {
      > tr > th {
        background: $white;
        font-weight: 400;
        position: relative;
        border-bottom: none;
        color: $gray-120;
        transition: none;
        padding: 15px 8px 15px 8px;

        &:not(:last-child):after {
          content: "";
          width: 1px;
          top: 0;
          bottom: 0;
          background: $strokes-light-trans-2;
          position: absolute;
          right: 0;
        }

        &.is-blank {
          padding: unset;

          &:after {
            display: none;
          }
        }

        &.no-after {
          &:after {
            display: none;
          }
        }

        &.dovetail-ant-table-cell-ellipsis.dovetail-ant-table-column-has-sorters
          .dovetail-ant-table-column-sorters {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          > span {
            flex: 1 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        &.dovetail-ant-table-column-has-sorters {
          padding: 15px 28px 15px 8px;

          .dovetail-ant-table-column-sorters {
            padding: 0;
            .order-icon {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              height: 16px;
              display: none;
              transition: transform 320ms ease;

              &.descend {
                display: block;
                transform: translateY(-50%) rotateX(180deg);
              }
              &.ascend {
                display: block;
              }
            }
          }
          .dovetail-ant-table-column-sorter {
            display: none;
          }
        }

        &:active {
          .dovetail-ant-table-column-sorters .order-icon {
            &.descend {
              transform: translateY(-50%);
            }
            &.ascend {
              transform: translateY(-50%) rotateX(180deg);
            }
          }
        }

        &:hover:not(.is-blank) {
          background: $fills-light-opaque-1;
          .dovetail-ant-table-column-sorters .order-icon {
            display: block;
          }
        }
      }
    }

    .dovetail-ant-table-selection-column {
      padding: 0 !important;

      .dovetail-ant-checkbox-wrapper {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      &:after {
        display: none;
      }
    }

    .dovetail-ant-table-hide-scrollbar {
      background: $white;
    }
    .dovetail-ant-table-placeholder {
      background: inherit;

      td {
        position: static;
        border: none;
        background: inherit !important;
        height: 100px;
        vertical-align: middle;
      }

      .table-default-empty,
      .dovetail-ant-table-expanded-row-fixed {
        font-weight: bold;
        font-size: 20px;
        color: $text-terdiary-light;
      }
    }
    td.cell__action_ {
      padding: 0 !important;
      position: relative;
      background: $white;
      > * {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 8px;
      }
      .menu-button {
        width: 24px;
        height: 24px;
        cursor: pointer;
        justify-content: center;
        border-radius: 4px;

        &:hover {
          background: $white;
        }
      }
    }
  }
`;

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
