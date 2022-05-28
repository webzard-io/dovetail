import React from "react";
import { kit } from "./CloudTower";
export { kit as CloudTowerKit } from "./CloudTower";

type RefAndChildren = {
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement> | null;
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

type ButtonProps = {
  type?: typeof buttonTypes[number];
  size?: typeof buttonSizes[number];
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
} & RefAndChildren;

type TableProps = {
  data: any[];
  columns: {
    key: string;
    title: string;
    dataIndex: string | number | Array<string | number>;
    width?: number;
    render?: (val: any, record: any, index: number) => React.ReactNode;
  }[];
  loading?: boolean;
  rowKey: string | ((record: any, index?: number) => string);
  onSelect?: (keys: string[], records: any[]) => void;
  selectedKeys?: string[];
  onActive?: (key: string, record: any) => void;
  activeKey?: string;
} & RefAndChildren;

type SidebarProps = {
  className?: string;
  width?: number;
  visible?: boolean;
  onClose?: () => void;
  getContainer: string | (() => HTMLElement);
} & RefAndChildren;

type TagProps = {
  className?: string;
  color?: string;
  closable?: boolean;
  onClose?: () => void;
} & RefAndChildren;

type ModalProps = {
  className?: string;
  width?: number;
  visible?: boolean;
  maskClosable?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  getContainer: string | (() => HTMLElement);
} & RefAndChildren;

export interface Kit {
  name: string;
  Button: React.FC<ButtonProps>;
  Table: React.FC<TableProps>;
  Loading: React.FC;
  Sidebar: React.FC<SidebarProps>;
  Tag: React.FC<TagProps>;
  Modal: React.FC<ModalProps>;
}

export const createKitContext = (kit: Kit) => {
  return React.createContext(kit);
};

export const KitContext = createKitContext(kit);
