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
} & RefAndChildren;

export interface Kit {
  name: string;
  Button: React.FC<ButtonProps>;
}

export const createKitContext = (kit: Kit) => {
  return React.createContext(kit);
};

export const KitContext = createKitContext(kit);
