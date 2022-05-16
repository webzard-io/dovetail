import { implementRuntimeComponent } from "@sunmao-ui/runtime";
import { css } from "@emotion/css";
import { Type } from "@sinclair/typebox";
import _ObjectAge from "../../_internal/components/_ObjectAge";

const ObjectAgeProps = Type.Object({
  date: Type.String(),
});

const ObjectAgeState = Type.Object({});

export const ObjectAge = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "object_age",
    displayName: "Object Age",
    isDraggable: true,
    isResizable: true,
    exampleProperties: {
      date: "2022-01-01",
    },
    exampleSize: [1, 1],
    annotations: {
      category: "Display",
    },
  },
  spec: {
    properties: ObjectAgeProps,
    state: ObjectAgeState,
    methods: {},
    slots: {},
    styleSlots: ["text"],
    events: [],
  },
})(({ date, elementRef, customStyle }) => {
  return (
    <_ObjectAge
      date={date}
      ref={elementRef}
      className={css`
        ${customStyle?.text}
      `}
    />
  );
});
