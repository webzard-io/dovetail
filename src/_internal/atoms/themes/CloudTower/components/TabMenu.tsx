import React, { useMemo, useContext, useRef, useEffect, useState } from "react";
import { Menu, Dropdown } from "antd";
import { css } from "@linaria/core";
import cs from "classnames";
import { Typo } from "../styles/typo.style";
import Icon from "./Icon/Icon";

const TabMenuStyle = css`
  display: flex;
  flex-direction: column;
  flex: 1;

  .tab-bar {
    flex-shrink: 0;
    display: flex;
    border-bottom: 1px solid $strokes-translucent-1-light;
  }

  .tab-menu-item {
    margin-right: 2px;
    padding: 1px 12px;
    line-height: 24px;
    height: 24px;
    color: $text-secondary-light;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    transition: color 100ms ease-out, background-color 100ms ease-out,
      padding-left 320ms ease 80ms;

    &:first-child {
      padding-left: 0;

      &:hover,
      &.tab-menu-item-selected {
        padding-left: 12px;
      }
    }

    &:hover {
      color: $blue-60;
      background: $fills-trans-terdiary-light;

      .expand-arrow path {
        fill: $blue-60;
      }
    }

    &:active {
      background: $fills-trans-quaternary-light;
    }

    &.ant-dropdown-open {
      color: $blue-60;
      background: $fills-trans-terdiary-light;

      &:active {
        background: $fills-trans-quaternary-light;
      }

      &.tab-menu-item-selected {
        background: rgba($blue-60, 0.16);
      }

      .expand-arrow path {
        fill: $blue-60;
      }
    }

    &.tab-menu-item-selected {
      color: $blue-60;
      background: rgba($blue-60, 0.1);

      &:hover {
        background: rgba($blue-60, 0.16);
      }

      .expand-arrow path {
        fill: $blue-100;
      }
    }

    .expand-arrow {
      margin-left: 8px;
      height: 22px;
    }
    .expand-arrow path {
      fill: $text-secondary-light;
    }
  }

  .tab-menu-item-group {
    padding: 0;
    display: flex;
    align-items: center;
    overflow: hidden;

    .main-title {
      opacity: 0;
      max-width: 0;
      transition: max-width 320ms ease, opacity 240ms ease;
    }

    .sub-title {
      padding: 1px 12px;
      position: relative;
      display: flex;

      > .slash-arrow {
        opacity: 0;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        transition: opacity 100ms linear;
        fill: rgba($blue-60, 0.2);
      }
    }

    &.tab-menu-item-selected {
      color: $blue-60;

      .main-title {
        padding: 1px 12px;
        display: inline-block;
        opacity: 1;
        max-width: 160px;
      }

      .sub-title {
        padding: 1px 12px;
        color: $blue-80;

        > .slash-arrow {
          opacity: 1;
        }
      }

      &:hover,
      &:active {
        .sub-title {
          background: rgba($blue-60, 0.16);
        }
        .sub-title > .slash-arrow {
          opacity: 0;
        }
      }
    }
  }

  .tab-menu-item-medium {
    &.tab-menu-item {
      padding: 4px 16px;
      height: 32px;
      border-radius: 6px 6px 0 0;

      &:first-child {
        padding-left: 0;
      }
      &:first-child:hover,
      &.tab-menu-item-selected:first-child {
        padding-left: 16px;
      }

      .expand-arrow {
        margin-left: 11px;
        height: 24px;
      }
    }

    &.tab-menu-item-group {
      padding: 0;

      .sub-title {
        padding: 4px 16px;
      }

      &.tab-menu-item-selected .sub-title,
      &.tab-menu-item-selected .main-title {
        padding: 4px 16px;
      }
    }
  }

  .tab-menu-item-light {
    &:hover,
    &:active {
      background: $white;
    }

    &:active {
      color: $blue-80;
    }

    &.tab-menu-item.tab-menu-item-selected {
      background: $white;
      color: $blue-100;
    }

    &.tab-menu-item-group.tab-menu-item-selected {
      .main-title {
        color: rgba($gray-80, 0.6);
      }

      .sub-title {
        color: $blue-100;
      }

      .sub-title > .slash-arrow {
        fill: $fills-opaque-quaternary-light;
      }

      .sub-title > .expand-arrow path {
        fill: $blue-100;
      }
    }
  }

  .tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* FIXME:(yanzhen) do this better */
  &.is-overview .tab-content {
    overflow: visible;
  }
`;

const TabMenuSubMenu = css`
  max-width: 240px;
  animation: none;

  &.ant-dropdown .ant-dropdown-menu {
    border: 1px solid $blue-60;
    padding: 0;

    .ant-dropdown-menu-item {
      margin: 0;
      height: 32px;
      line-height: 32px;
      font-size: 13px;
      padding: 0 10px;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:not(:first-child) {
        &::before {
          content: " ";
          height: 1px;
          width: calc(100% + 10px);
          background: $strokes-translucent-1-light;
          display: block;
        }
      }

      &.ant-dropdown-menu-item-selected {
        color: $blue-60;
        background: transparent;
      }
    }
  }
`;

const renderExpandArrow = (size: string, isBold: boolean) => {
  if (size === "medium" && !isBold)
    return (
      <Icon type="1-arrow-chevron-down-16-blue" className="expand-arraw"></Icon>
    );

  if (size === "medium" && isBold)
    return (
      <Icon
        type="1-arrow-chevron-down-16-bold-blue"
        className="expand-arraw"
      ></Icon>
    );

  if (size === "small" && !isBold)
    return (
      <Icon
        type="1-arrow-chevron-down-small-16-blue"
        className="expand-arraw"
      ></Icon>
    );

  if (size === "small" && isBold)
    return (
      <Icon
        type="1-arrow-chevron-down-small-16-bold-blue"
        className="expand-arraw"
      ></Icon>
    );
};

export type TabMenuTab =
  | {
      key: string;
      title: string | React.ReactNode;
      items?: {
        key: string;
        title: string | React.ReactNode;
        onClick?: () => void;
        children: React.ReactNode;
        isOverview?: boolean;
      }[];
      children?: React.ReactNode;
      isAsync?: boolean;
      skeleton?: React.ReactNode;
      isOverview?: boolean;
    }
  | {
      key: string;
      title: string | React.ReactNode;
      children?: React.ReactNode;
      isAsync?: boolean;
      skeleton?: React.ReactNode;
      isOverview?: boolean;
    };

export type TabMenuProps = {
  size?: "small" | "medium";
  theme?: "default" | "light";
  selectedKey: string;
  tabs: TabMenuTab[];
  onChange?: (activeKey: string) => void;
};

const TabMenu: React.FC<TabMenuProps> = (props) => {
  const {
    tabs,
    onChange,
    selectedKey,
    size = "medium",
    theme = "default",
  } = props;
  const onChangeRef = useRef(onChange);
  const view = useMemo(() => {
    if (tabs.length === 0) return undefined;

    let result:
      | {
          key: string;
          children: React.ReactNode;
          title: string | React.ReactNode;
          isAsync?: boolean;
          skeleton?: React.ReactNode;
          isOverview?: boolean;
        }
      | undefined;

    tabs.some((tab) => {
      if ("items" in tab) {
        const select = tab.items?.find((item) => item.key === selectedKey);
        result = select
          ? {
              key: tab.key,
              children: select.children,
              title: select.title,
              isAsync: tab.isAsync,
              skeleton: tab.skeleton,
              isOverview: select.isOverview,
            }
          : undefined;
      } else if (tab.key === selectedKey) {
        result = {
          key: tab.key,
          children: tab.children,
          title: tab.title,
          isAsync: tab.isAsync,
          skeleton: tab.skeleton,
          isOverview: tab.isOverview,
        };
      }

      return result;
    });

    if (!result) {
      //  cannot update during an existing state transition
      setTimeout(() => {
        onChangeRef.current?.(tabs[0].key);
      }, 0);
      return tabs[0];
    }

    return result;
  }, [tabs, selectedKey]);
  const isMedium = size === "medium";
  const viewKey = view?.key;
  const isAsync = view?.isAsync;
  const [transitioned, setTransitioned] = useState(false);
  const viewKeyRef = useRef(view?.key);

  useEffect(() => {
    // set the flag to false when tab key is changed
    setTransitioned(false);
    viewKeyRef.current = viewKey;

    // reset the flag when transition has finished
    const timeout = setTimeout(() => {
      setTransitioned(true);
    }, 320);

    return () => {
      clearTimeout(timeout);
    };
  }, [viewKey]);

  const renderTabContent = () => {
    if (!isAsync && view?.children) return view.children;
    if (
      isAsync &&
      transitioned &&
      viewKey === viewKeyRef.current &&
      view?.children
    )
      return view.children;
    if (view?.skeleton) return view.skeleton;

    return null;
  };

  return (
    <div
      className={cs(
        TabMenuStyle,
        "tab-menu",
        view?.isOverview && "is-overview"
      )}
    >
      <div className="tab-bar">
        {tabs.map((tab) => {
          const isSelected = view?.key === tab.key;

          let typo = Typo.Label.l2_regular_title;
          if (isMedium && isSelected) {
            typo = Typo.Label.l1_bold_title;
          } else if (isMedium && !isSelected) {
            typo = Typo.Label.l1_regular_title;
          } else if (!isMedium && isSelected) {
            typo = Typo.Label.l2_bold_title;
          }

          if ("items" in tab) {
            // Tab Group
            return (
              <Dropdown
                key={tab.key}
                overlayClassName={TabMenuSubMenu}
                transitionName="no-animation"
                overlay={
                  <Menu
                    selectedKeys={[selectedKey]}
                    onClick={(params) => onChange?.(params.key as string)}
                  >
                    {tab.items?.map((item) => (
                      <Menu.Item data-test={item.key} key={item.key}>
                        {item.title}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={["click"]}
              >
                <span
                  className={cs([
                    "tab-menu-item",
                    "tab-menu-item-group",
                    isSelected && "tab-menu-item-selected",
                    isMedium && "tab-menu-item-medium",
                    theme === "light" && "tab-menu-item-light",
                  ])}
                >
                  <span
                    className={cs([
                      "main-title",
                      isMedium
                        ? Typo.Label.l1_regular_title
                        : Typo.Label.l2_regular_title,
                    ])}
                  >
                    {tab.title}
                  </span>
                  <span
                    className={cs(["sub-title", typo])}
                    data-test={isSelected ? view?.title : tab.title}
                  >
                    {/* FIXME: 这个 icon 的 svg 文件设计还没整理，待设计输出 svg 后，应该抽离为统一的 svg 文件，而不是在代码里写死。 */}
                    <svg
                      className="slash-arrow"
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.81662 3.33203C5.15455 3.555 5.32351 3.66649 5.38224 3.80736C5.43358 3.93049 5.43358 4.06904 5.38224 4.19218C5.32351 4.33305 5.15455 4.44454 4.81662 4.66751L1.81921 6.64529C1.4159 6.91141 1.21424 7.04446 1.04715 7.03393C0.901576 7.02475 0.767265 6.95246 0.679429 6.836C0.578613 6.70234 0.578613 6.46074 0.578613 5.97755L0.578613 2.02199C0.578613 1.53879 0.578613 1.2972 0.679429 1.16353C0.767265 1.04708 0.901576 0.974785 1.04715 0.965607C1.21424 0.955073 1.4159 1.08813 1.81921 1.35425L4.81662 3.33203Z" />
                    </svg>
                    <span className="sub-title-text">
                      {isSelected ? view?.title : tab.title}
                    </span>
                    {renderExpandArrow(size, isSelected)}
                  </span>
                </span>
              </Dropdown>
            );
          }

          return (
            <span
              className={cs([
                "tab-menu-item",
                isSelected && "tab-menu-item-selected",
                isMedium && "tab-menu-item-medium",
                theme === "light" && "tab-menu-item-light",
                typo,
              ])}
              key={tab.key}
              data-test={tab.title}
              onClick={() => onChange?.(tab.key)}
            >
              {tab.title}
            </span>
          );
        })}
      </div>
      {renderTabContent()}
    </div>
  );
};

export default TabMenu;
