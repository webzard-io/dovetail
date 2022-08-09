import React from "react";
import { kit as CloudTowerKit } from "./themes/CloudTower";
import { DropDownProps } from 'antd/lib/dropdown';
export { CloudTowerKit };

type RefAndChildren = {
  children?: React.ReactNode;
  ref?: React.Ref<any> | null;
};
type RefOnly = {
  ref?: React.Ref<any> | null;
};

export const buttonTypes = [
  "default",
  "primary",
  "ghost",
  "dashed",
  "link",
  "text",
] as const;

export const buttonSizes = ["small", "middle", "large"];

export type ButtonProps = {
  type?: typeof buttonTypes[number];
  size?: typeof buttonSizes[number];
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
} & RefAndChildren;

export type TableProps = {
  data: any[];
  error?: React.ReactNode;
  columns: {
    key: string;
    title: string | React.ReactNode;
    dataIndex: string | number | Array<string | number>;
    width?: number;
    isActionColumn?: boolean;
    canCustomizable?: boolean;
    isDefaultDisplay?: boolean;
    ellipsis?: boolean;
    render?: (val: any, record: any, index: number) => React.ReactNode;
  }[];
  loading?: boolean;
  rowKey: string | ((record: any, index?: number) => string);
  customizable?: boolean;
  customizableKey?: string;
  onSelect?: (keys: string[], records: any[]) => void;
  selectedKeys?: string[];
  onActive?: (key: string, record: any) => void;
  activeKey?: string;
  tableLayout?: "auto" | "fixed";
  scroll?: { x?: string; y?: string };
  empty?: string;
  bordered?: boolean;
  resizable?: boolean;
  onSorterChange?: (order: string, key: string) => void;
} & RefAndChildren;

export type SidebarProps = {
  className?: string;
  width?: number;
  visible?: boolean;
  onClose?: () => void;
  getContainer: string | (() => HTMLElement);
} & RefAndChildren;

export type TagProps = {
  className?: string;
  color?: string;
  closable?: boolean;
  onClose?: () => void;
} & RefAndChildren;

export type ModalProps = {
  className?: string;
  width?: number;
  visible?: boolean;
  maskClosable?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  getContainer: string | (() => HTMLElement);
} & RefAndChildren;

export type CodeEditorProps = {
  className?: string;
  defaultValue?: string;
  language?: string;
  minimap?: boolean;
  onChange?: (newValue: string) => void;
  onBlur?: (newValue: string) => void;
} & RefAndChildren;

export type CardProps = {
  collapsible?: boolean;
  defaultOpen?: boolean;
  title?: React.ReactNode | string;
  subInfo?: React.ReactNode;
} & RefAndChildren;

export type InfoRowProps = {
  label: React.ReactNode;
  content: boolean | {} | string | number | JSX.Element;
  className?: string;
};

type TabMenuTab =
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

interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export type CheckboxProps = {
  prefixCls?: string;
  className?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
  onChange?: (e: CheckboxChangeEvent) => void;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onKeyPress?: React.KeyboardEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  value?: any;
  tabIndex?: number;
  name?: string;
  children?: React.ReactNode;
  id?: string;
  autoFocus?: boolean;
  type?: string;
  indeterminate?: boolean;
}

export interface Kit {
  name: string;
  Button: React.FC<ButtonProps>;
  Table: React.FC<TableProps>;
  Loading: React.FC<RefOnly>;
  Sidebar: React.FC<SidebarProps>;
  Tag: React.FC<TagProps>;
  Modal: React.FC<ModalProps>;
  CodeEditor: React.FC<CodeEditorProps>;
  Card: React.FC<CardProps>;
  InfoRow: React.FC<InfoRowProps>;
  TabMenu: React.FC<TabMenuProps>;
  Checkbox: React.FC<CheckboxProps>;
  Dropdown: React.FC<DropDownProps>;
}

export const createKitContext = (kit: Kit) => {
  return React.createContext(kit);
};

export const KitContext = createKitContext(CloudTowerKit);
