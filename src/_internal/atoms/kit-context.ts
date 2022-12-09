import React from "react";
import { kit as CloudTowerKit } from "./themes/CloudTower";
import { DropDownProps } from "antd/lib/dropdown";
import { ModalProps as AntdModalProps } from "antd/lib/modal";
import { InputProps as AntdInputProps } from "antd/lib/input/Input";
import { InputNumberProps as AntdInputNumberProps } from "antd/lib/input-number/index";
import { SelectProps as AntdSelectProps } from "antd/lib/select/index";
import { SwitchProps as AntdSwitchProps } from "antd/lib/switch/index";
import { TooltipProps as AntdTooltipProps } from "antd/lib/tooltip";
export { CloudTowerKit };

type RefAndChildren = {
  children?: React.ReactNode;
  ref?: React.Ref<any> | null;
};
type RefOnly = {
  ref?: React.Ref<any> | null;
};

export const buttonTypes = [
  "danger",
  "ordinary",
  "default",
  "primary",
  "ghost",
  "dashed",
  "link",
  "text",
  "quiet",
] as const;

export const buttonSizes = ["small", "middle", "large"];

export type ButtonProps = {
  type?: typeof buttonTypes[number];
  size?: typeof buttonSizes[number];
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
  hoverPrefixIcon?: string;
  prefixIcon?: string;
  suffixIcon?: string;
} & RefAndChildren;

export type TableProps = {
  data: any[];
  error?: React.ReactNode;
  columns: {
    key: string;
    title: string | React.ReactNode;
    dataIndex: string | number | Array<string | number>;
    width?: number;
    ellipsis?: boolean;
    render?: (val: any, record: any, index: number) => React.ReactNode;
  }[];
  components?: {
    table?: (props: any) => any;
    header?: {
      wrapper?: (props: any) => any;
      row?: (props: any) => any;
      cell?: (props: any) => any;
    };
    body?: {
      wrapper?: (props: any) => any;
      row?: (props: any) => any;
      cell?: (props: any) => any;
    };
  };
  wrapper: React.MutableRefObject<any>;
  loading?: boolean;
  rowKey: string | ((record: any, index?: number) => string);
  customizable?: boolean;
  customizableKey?: string;
  onSelect?: (keys: string[], records: any[]) => void;
  selectedKeys?: string[];
  onActive?: (key: string, record: any) => void;
  activeKey?: string;
  tableLayout?: "auto" | "fixed";
  scroll?: { x?: string | number; y?: string | number };
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
  afterClose?: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  getContainer: string | (() => HTMLElement);
  size?: "small" | "medium";
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
  className?: string;
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
};

export type PaginationProps = {
  current: number;
  count: number;
  size: number;
  onChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  simple?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  selectorVisible?: boolean;
  className?: string;
};

export type Modal2Props = AntdModalProps & {
  /** Set is fullscreen to display modal */
  fullscreen?: boolean;
  /** Set loading type for ok button */
  okLoading?: boolean;
  /** Set disabled type for ok button */
  okDisabled?: boolean;
  /** Set error in footer */
  footerError?: string | React.ReactNode | Error;
  children?: React.ReactNode;
  /** Display cancel button */
  showCancel?: boolean;
  /** Display ok button */
  showOk?: boolean;
  /** Set is a normal modal, width is 460px. If width is set it will fail */
  normal?: boolean;
  // FIXME: add props size
  size?: "normal" | "medium" | "fullscreen";
  showFooter?: boolean;
};

export type InputProps = Omit<AntdInputProps, "onChange"> & {
  error?: boolean;
  supportNegativeValue?: boolean;
  maximum?: number;
  minimum?: number;
  type: AntdInputProps["type"] | "int" | "float";
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string | number | undefined
  ) => void;
};

export type InputNumberProps = AntdInputNumberProps & { error?: boolean };

export type SelectProps = {
  defaultValue?: string;
  error?: unknown | React.ReactNode;
  danger?: boolean;
  multiple?: boolean;
  scrollBottomBuffer?: number;
  onScrollBottom?: () => void;
  selectLimit?: number;
  onChange: (value: string | string[], option: any) => void;
} & Omit<AntdSelectProps<string>, "onChange">;

export type SwitchProps = Omit<AntdSwitchProps, "size"> & {
  size?: "small" | "default" | "large";
};

export type TooltipProps = AntdTooltipProps & {
  followMouse?: boolean;
};

export interface Kit {
  name: string;
  PAGINATION_SELECTOR: string;
  TABLE_WRAPPER_SELECTOR: string;
  THEAD_SELECTOR: string;
  TBODY_SELECTOR: string;
  MODAL_WHITELIST: string[];
  Button: React.FC<ButtonProps>;
  Table: React.FC<TableProps>;
  Loading: React.FC<RefOnly>;
  Sidebar: React.FC<SidebarProps>;
  Tag: React.FC<TagProps>;
  Modal: React.FC<ModalProps>;
  FullscreenModal: React.FC<Modal2Props>;
  CodeEditor: React.FC<CodeEditorProps>;
  Card: React.FC<CardProps>;
  InfoRow: React.FC<InfoRowProps>;
  TabMenu: React.FC<TabMenuProps>;
  Checkbox: React.FC<CheckboxProps>;
  Dropdown: React.FC<DropDownProps>;
  Pagination: React.FC<PaginationProps>;
  Input: React.FC<InputProps>;
  InputNumber: React.FC<InputNumberProps>;
  Select: React.FC<SelectProps>;
  Switch: React.FC<SwitchProps>;
  Tooltip: React.FC<TooltipProps>;
}

export const createKitContext = (kit: Kit) => {
  return React.createContext(kit);
};

export const KitContext = createKitContext(CloudTowerKit);
