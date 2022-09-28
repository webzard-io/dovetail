import {
  implementRuntimeComponent,
  DIALOG_CONTAINER_ID,
} from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import { css, cx } from "@emotion/css";
import React, { useContext, useState, useCallback, useEffect } from "react";
import { KitContext } from "../../_internal/atoms/kit-context";
import { useTranslation } from "react-i18next";
import { styled } from "@linaria/react";
import { Typo } from "../../_internal/atoms/themes/CloudTower/styles/typo.style";

const ModalStyle = css`
  .ant-modal-header {
    border-radius: 16px !important;
  }
  .ant-modal-content {
    border-radius: 16px !important;
  }
  .ant-modal-body {
    padding: 0;
    border-radius: 16px;
  }
  .ant-modal-footer {
    display: none;
  }

  .ant-modal .ant-modal-close-x {
    right: 20px;
    top: 20px;
  }
`;

const Text = styled.div`
  margin-bottom: 2px;
`;

const Tip = styled.div`
  color: rgba(44, 56, 82, 0.6);
`;

export const ConfirmModal = implementRuntimeComponent({
  version: "kui/v1",
  metadata: {
    name: "confirm_modal",
    displayName: "Confirm Modal",
    description: "",
    exampleProperties: {
      width: 492,
      title: "Delete",
    },
    annotations: {
      category: PRESET_PROPERTY_CATEGORY.Basic,
    },
  },
  spec: {
    properties: Type.Object({
      defaultVisible: Type.Boolean({
        title: "Default visible",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      width: Type.Number({
        title: "Width",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      title: Type.String({
        title: "Title",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      text: Type.String({
        title: "Text",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      tip: Type.String({
        title: "Tip",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      confirmButtonText: Type.String({
        title: "Confirm button text",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      confirmButtonLoading: Type.Boolean({
        title: 'Confirm button loading',
        category: PRESET_PROPERTY_CATEGORY.Basic
      })
    }),
    state: Type.Object({}),
    methods: {
      open: Type.Object({}),
      close: Type.Object({}),
    },
    slots: {
      content: {
        slotProps: Type.Object({}),
      },
      footer: {
        slotProps: Type.Object({}),
      },
    },
    styleSlots: ["content"],
    events: ["onCancel", "onConfirm"],
  },
})(
  ({
    defaultVisible,
    width,
    title,
    text,
    tip,
    confirmButtonText,
    confirmButtonLoading,
    customStyle,
    elementRef,
    slotsElements,
    callbackMap,
    subscribeMethods,
  }) => {
    const [visible, setVisible] = useState(defaultVisible);
    const { t } = useTranslation();
    const kit = useContext(KitContext);

    const onCancel = useCallback(() => {
      setVisible(false);
      callbackMap?.onCancel?.();
    }, [callbackMap]);

    const footer = (
      <>
        <kit.Button type="text" onClick={onCancel}>
          {t("dovetail.cancel")}
        </kit.Button>
        <kit.Button type="danger" loading={confirmButtonLoading} onClick={callbackMap?.onConfirm}>
          {confirmButtonText || t("dovetail.delete")}
        </kit.Button>
      </>
    );
    const content = (
      <>
        <Text className={Typo.Label.l2_regular}>{text}</Text>
        <Tip className={Typo.Label.l4_regular}>{tip}</Tip>
      </>
    );

    useEffect(() => {
      subscribeMethods({
        open() {
          setVisible(true);
        },
        close() {
          setVisible(false);
        },
      });
    }, [subscribeMethods]);

    return (
      <kit.Modal
        ref={elementRef}
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        visible={visible}
        className={cx(ModalStyle, css(customStyle?.content))}
        title={title}
        width={width}
        footer={slotsElements.footer?.({}, footer) || footer}
        onClose={onCancel}
      >
        {slotsElements.content?.({}, content) || content}
      </kit.Modal>
    );
  }
);
