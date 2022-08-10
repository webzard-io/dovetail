import React, { useContext, useEffect, useMemo, useRef } from "react";
import { css } from "@linaria/core";
import cs from "classnames";
import Icon from "../Icon/Icon";
import { KitContext } from "../../../../kit-context";
import { Menu } from "antd";

export interface PaginationProps {
  current: number;
  count: number;
  size: number;
  onChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  simple?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  selectorVisible?: boolean;
  className?: string;
}

const PaginationStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  color: $text-light-secondary;
  font-size: 12px;
  line-height: 24px;

  .pagination-left {
    padding: 2px 8px;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: $fills-interaction-light-general-hover;
      color: $text-light-general;
    }
    .icon-inner {
      margin-left: 4px;
    }
  }

  .pagination-right {
    display: flex;
    align-items: center;
    color: $blue-60;
    font-weight: bold;
    .icon-inner {
      margin-left: 4px;
    }
    .prev-btn,
    .next-btn {
      padding: 0 8px;
      > span {
        color: $text-light-general;
      }
    }

    .next-btn {
      .icon-inner {
        transform: rotate(180deg);
      }
    }
  }
`;

const DropdownOverlayStyle = css`
  &.dovetail-ant-dropdown .dovetail-ant-dropdown-menu {
    max-height: calc(100vh - 128px);
    overflow-y: auto;

    .dovetail-ant-dropdown-menu-item {
      padding: 4px 20px;
      font-size: 12px;
      line-height: 18px;
    }
  }
`;

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    current,
    count,
    onChange,
    size,
    onSizeChange,
    showTotal = true,
    className,
    selectorVisible = true,
  } = props;
  const kit = useContext(KitContext);
  const sizeRef = useRef(size);
  useEffect(() => {
    if (sizeRef.current === size) return;
    sizeRef.current = size;
    onSizeChange?.(size);
  }, [count, size, onSizeChange]);

  const selectOptions = useMemo(() => {
    if (!selectorVisible) return [];
    return Array.from({ length: Math.ceil(count / size) }, (r, i) => {
      const value = i * size;
      const lastRange = value + size;
      return {
        value: i + 1,
        text: `Item ${value + 1} - ${lastRange > count ? count : lastRange}`
      };
    });
  }, [selectorVisible, count, size]);

  let lastRange = current * size;
  lastRange = lastRange > count ? count : lastRange;

  const renderLeft = () => {
    if (!showTotal) return null;
    const content = `Item ${(current - 1) * size + 1} – ${lastRange}, ${count} in total`;
    if (selectorVisible) {
      return (
        <kit.Dropdown
          placement="topLeft"
          overlayClassName={DropdownOverlayStyle}
          overlay={
            <Menu>
              <Menu.ItemGroup title="Jump to">
                {selectOptions.map((option) => (
                  <Menu.Item
                    key={option.value}
                    onClick={() => onChange(option.value)}
                  >
                    {option.text}
                  </Menu.Item>
                ))}
              </Menu.ItemGroup>
            </Menu>
          }
        >
          <Icon
            className="pagination-left dropdown-trigger"
            type="1-arrow-chevron-down-small-16-secondary"
            hoverType="1-arrow-chevron-down-small-16-blue"
            prefix={content}
          />
        </kit.Dropdown>
      );
    }
    return <span className="pagination-left">{content}</span>;
  };

  if (count === 0) {
    // do not render when count is 0
    return null;
  }

  return (
    <div
      className={cs(
        PaginationStyle,
        "pagination-wrapper",
        className,
        selectorVisible && "has-selector"
      )}
    >
      {renderLeft()}
      <span className="pagination-right">
        {current > 1 && (
          <kit.Button
            className="prev-btn"
            type="quiet"
            size="small"
            prefixIcon="1-arrow-chevron-left-small-16-bold-blue"
            onClick={() => {
              onChange?.(current - 1);
            }}
          >
            Previous {size} items
          </kit.Button>
        )}
        {current * size < count && (
          <kit.Button
            className="next-btn"
            type="quiet"
            size="small"
            suffixIcon="1-arrow-chevron-left-small-16-bold-blue"
            onClick={() => {
              onChange?.(current + 1);
            }}
          >
            Next {size} items
          </kit.Button>
        )}
      </span>
    </div>
  );
};

export default Pagination;
