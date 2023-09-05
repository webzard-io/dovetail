import React, { useContext, DragEvent } from "react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { kitContext } from "@cloudtower/eagle";
import { useCustomizeColumn, CustomizeColumnType } from "./customize-column";
import { arrayMove } from "./common";
import Icon from "../Icon/Icon";
import { useTranslation } from "react-i18next";

const DropdownWrapper = css`
  &.ant-dropdown {
    background: $white;
    border: 1px solid #dfe4eb;
    box-shadow: 0px 8px 16px rgba(129, 138, 153, 0.18),
      0px 0px 4px rgba(235, 239, 245, 0.6);
    border-radius: 3px;
    max-height: 400px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0px;
      background: transparent;
    }
    .ant-checkbox-wrapper {
      margin-right: 20px;
    }
  }
`;

const Title = styled.div`
  font-size: 12px;
  line-height: 18px;
  color: rgba(129, 138, 153, 0.6);
  margin: 8px 12px 10px 12px;
`;

const CheckboxStyle = css`
  width: 100%;

  .column-checkbox-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    &:hover {
      background: rgba(0, 128, 255, 0.1);
    }

    &.on-dragenter-top:before,
    &.on-dragenter-bottom:before {
      content: " ";
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: rgba(0, 128, 255, 0.6);
    }

    &.on-dragenter-top:before {
      top: 0;
    }

    &.on-dragenter-bottom:before {
      bottom: 0;
    }

    .ant-checkbox-wrapper {
      padding: 6px 0px 6px 12px;
      flex: 1;

      .ant-checkbox + span {
        color: $gray-80;
      }
      &.ant-checkbox-wrapper-disabled .ant-checkbox + span {
        opacity: 0.4;
      }
    }

    .point-group {
      position: relative;
      width: 6px;
      height: 14px;
      padding-right: 15px;
      cursor: pointer;

      &:hover i {
        background: $blue-60;
      }

      i {
        position: absolute;
        width: 2px;
        height: 2px;
        border-radius: 1px;
        background: $gray-70;

        &:nth-child(1) {
          top: 0;
          left: 0;
        }
        &:nth-child(2) {
          top: 0px;
          left: 4px;
        }
        &:nth-child(3) {
          top: 4px;
          left: 0;
        }
        &:nth-child(4) {
          top: 4px;
          left: 4px;
        }
        &:nth-child(5) {
          top: 8px;
          left: 0px;
        }
        &:nth-child(6) {
          top: 8px;
          left: 4px;
        }
        &:nth-child(7) {
          top: 12px;
          left: 0px;
        }
        &:nth-child(8) {
          top: 12px;
          left: 4px;
        }
      }
    }
  }
`;

type Customize = CustomizeColumnType & {
  title: React.ReactNode;
  disable: boolean;
};

type CustomizeColumnProps = {
  defaultCustomizeColumn: [
    string,
    CustomizeColumnType[] | (() => CustomizeColumnType[])
  ];
  disabledColumnKeys: string[];
  allColumnKeys?: string[];
  columnTitleMap: Record<string, React.ReactNode | (() => React.ReactNode)>;
  ["data-test-id"]: string;
  customizableColumnKeys?: string[];
};

let dragColumnIndex = 0;

const DropdownOverlay: React.FC<CustomizeColumnProps> = (props) => {
  const { t } = useTranslation();
  const kit = useContext(kitContext);
  const {
    defaultCustomizeColumn,
    allColumnKeys,
    disabledColumnKeys,
    columnTitleMap,
    customizableColumnKeys,
  } = props;
  const [customizeColumn, setCustomizeColumn] = useCustomizeColumn(
    ...defaultCustomizeColumn
  );

  const columns = customizeColumn.map((column) => {
    let title: React.ReactNode = "";
    const mappedTitle = columnTitleMap[column.key];
    if (column.key === "_action_") {
      title = t("dovetail.action");
    } else if (typeof mappedTitle === "function") {
      title = mappedTitle();
    } else if (mappedTitle) {
      title = mappedTitle;
    }
    const isRender = () => {
      if (allColumnKeys && !allColumnKeys.includes(column.key)) {
        return false;
      }
      if (customizableColumnKeys) {
        return customizableColumnKeys.includes(column.key);
      }
      return true;
    };
    return {
      ...column,
      disable: disabledColumnKeys.includes(column.key),
      title,
      render: isRender(),
    };
  });

  const dragProps = (column: Customize, index: number) => {
    return {
      draggable: !column.disable,
      onDragStart: () => {
        dragColumnIndex = index;
      },
      onDragEnter: (event: DragEvent<HTMLDivElement>) => {
        if (dragColumnIndex === index || column.disable) return;
        const item = event.currentTarget.closest(".column-checkbox-item")!;
        const klass =
          dragColumnIndex > index ? "on-dragenter-top" : "on-dragenter-bottom";

        const classList = item.classList;
        classList.contains(klass) || classList.add(klass);
      },
      onDragLeave: (event: DragEvent<HTMLDivElement>) => {
        if (dragColumnIndex === index) return;
        const item = event.currentTarget.closest(".column-checkbox-item")!;
        if (!item.contains(event.relatedTarget as HTMLElement)) {
          item.classList.remove("on-dragenter-top", "on-dragenter-bottom");
        }
      },
      onDrop: (event: DragEvent) => {
        if (dragColumnIndex === index || column.disable) return;

        const item = event.currentTarget.closest(".column-checkbox-item")!;
        if (!item.contains(event.relatedTarget as HTMLElement)) {
          item.classList.remove("on-dragenter-top", "on-dragenter-bottom");
        }
        setCustomizeColumn((columns) => {
          return arrayMove(columns, dragColumnIndex, index);
        });
      },
      onDragOver: (event: DragEvent) => event.preventDefault(),
    };
  };

  return (
    <>
      <Title>{t("dovetail.custom_column")}</Title>
      <kit.checkboxGroup
        className={CheckboxStyle}
        defaultValue={customizeColumn
          .filter((item) => item.display)
          .map((item) => {
            return item.key;
          })}
      >
        {columns.map((column, index) => {
          return (
            column.render && (
              <div
                className="column-checkbox-item"
                key={column.key}
                {...dragProps(column, index)}
              >
                <kit.checkbox
                  value={column.key}
                  disabled={column.disable}
                  onChange={(event) => {
                    setCustomizeColumn((columns) => {
                      // TODO: should not init width
                      const defaultColumn =
                        typeof defaultCustomizeColumn[1] === "function"
                          ? defaultCustomizeColumn[1]()
                          : defaultCustomizeColumn[1];

                      columns.forEach((column, index) => {
                        column.width = defaultColumn[index].width;
                      });
                      columns[index].display = event.target.checked;
                      return columns;
                    });
                  }}
                >
                  {column.title}
                </kit.checkbox>
                {!column.disable && (
                  // TODO: wait icon
                  <div className="point-group">
                    {Array.from({ length: 8 }, (x, i) => i).map((i) => (
                      <i key={i}></i>
                    ))}
                  </div>
                )}
              </div>
            )
          );
        })}
      </kit.checkboxGroup>
    </>
  );
};

const CustomizeColumn: React.FC<CustomizeColumnProps> = (props) => {
  const kit = useContext(kitContext);

  return (
    <kit.dropdown
      data-test-id={props["data-test-id"]}
      overlayClassName={DropdownWrapper}
      overlay={<DropdownOverlay {...props} />}
      trigger={["click"]}
    >
      <Icon
        className="anticon-setting"
        type="1-settings-gear-16-gradient-gray"
        hoverType="1-settings-gear-16-gradient-blue"
        alt="setting"
        aria-label="setting"
      />
    </kit.dropdown>
  );
};

export default CustomizeColumn;
