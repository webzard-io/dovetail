import {
  ImplWrapper,
  SlotTraitPropertiesSpec,
  UIServices,
  formatSlotKey,
  SlotsElements,
} from "@sunmao-ui/runtime";
import type {
  RuntimeApplication,
  RuntimeComponentSchema,
} from "@sunmao-ui/core";
import React from "react";
import { Static } from "@sinclair/typebox";

type SlotTraitProps = Static<typeof SlotTraitPropertiesSpec>;

type Props = {
  app: RuntimeApplication;
  allComponents: RuntimeComponentSchema[];
  component: RuntimeComponentSchema;
  services: UIServices;
  slot: string;
  slotKey: string;
  slotsElements: SlotsElements<any>;
  fallback?: React.ReactNode;
};

type Options = {
  generateId: (child: RuntimeComponentSchema) => string;
  generateProps: () => Record<string, unknown>;
};

export const generateSlotChildren = (
  { allComponents, app, component, services, slot, slotKey, fallback, slotsElements }: Props,
  { generateId, generateProps }: Options
) => {
  const renderSet = new Set<string>();
  const slotTraitTypes = ["core/v1/slot", "core/v2/slot"];
  const childrenSchema = allComponents.filter((c) => {
    return c.traits.find(
      (t) =>
        slotTraitTypes.includes(t.type) &&
        (t.properties as SlotTraitProps).container.id === component.id &&
        (t.properties as SlotTraitProps).container.slot === slot
    );
  });

  const _childrenSchema = childrenSchema.map((child) => {
    const id = generateId(child);

    renderSet.add(id);

    return {
      ...child,
      id,
    };
  });
  // don't remove this code, it should be called for generate the slot context
  const slots =
    slotsElements[slot]?.(generateProps(), fallback, slotKey) || fallback;

  return _childrenSchema.length
    ? _childrenSchema.map((child) => {
        return (
          <ImplWrapper
            key={child.id}
            component={child}
            app={app}
            allComponents={allComponents}
            services={services}
            allComponents={allComponents}
            childrenMap={{}}
            isInModule
            slotContext={{
              renderSet,
              slotKey: formatSlotKey(component.id, slot, slotKey),
            }}
          />
        );
      })
    : fallback;
};
