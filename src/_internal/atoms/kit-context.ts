import React from "react";
import { kit as CloudTowerKit } from "./themes/CloudTower";
import { TableProps as BaseTableProps } from "./themes/CloudTower/components/Table/Table";
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

export type TableProps<T extends { id: string }> = BaseTableProps<T> &
  RefAndChildren;

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

export interface Kit {
  name: string;
  Button: React.FC<ButtonProps>;
  Table: React.FC<TableProps>;
  Loading: React.FC<RefOnly>;
  Sidebar: React.FC<SidebarProps>;
  Tag: React.FC<TagProps>;
  Modal: React.FC<ModalProps>;
  CodeEditor: React.FC<CodeEditorProps>;
}

export const createKitContext = (kit: Kit) => {
  return React.createContext(kit);
};

export const KitContext = createKitContext(CloudTowerKit);
