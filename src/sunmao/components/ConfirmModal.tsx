import {
  implementRuntimeComponent,
  DIALOG_CONTAINER_ID,
  StringUnion,
} from "@sunmao-ui/runtime";
import { Type } from "@sinclair/typebox";
import { PRESET_PROPERTY_CATEGORY } from "@sunmao-ui/shared";
import { css, cx } from "@emotion/css";
import React, { useContext, useState, useCallback, useEffect } from "react";
import { kitContext, ButtonProps } from "@cloudtower/eagle";
import { useTranslation } from "react-i18next";
import { styled } from "@linaria/react";
import { Typo } from "../../_internal/atoms/themes/CloudTower/styles/typo.style";
import Icon from "../../_internal/atoms/themes/CloudTower/components/Icon/Icon";
import { CommonModalStyle } from "./Modal";
import BaseModal from "src/_internal/atoms/themes/CloudTower/components/FullscreenModal/Modal";

const FooterWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;
const FooterError = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  font-size: 13px;
  color: $red-60;
  text-align: left;

  .modal-error-icon {
    margin-right: 6px;
  }

  .modal-error-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Text = styled.div`
  margin-bottom: 2px;
`;

const Tip = styled.div`
  color: rgba(44, 56, 82, 0.6);
  margin-bottom: 2px;
`;
const ErrorReason = styled.div`
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
      errors: [],
      size: "small",
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
      errors: Type.Array(Type.String(), {
        title: "Errors",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      size: StringUnion(["small", "medium"], {
        title: "Size",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      footerError: Type.String({
        title: "Footer Error",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      confirmButtonText: Type.String({
        title: "Confirm button text",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
      confirmButtonType: StringUnion(
        [
          "danger",
          "default",
          "text",
          "link",
          "ordinary",
          "primary",
          "ghost",
          "dashed",
          "quiet",
        ],
        {
          title: "Confirm button type",
          category: PRESET_PROPERTY_CATEGORY.Basic,
        }
      ),
      confirmButtonLoading: Type.Boolean({
        title: "Confirm button loading",
        category: PRESET_PROPERTY_CATEGORY.Basic,
      }),
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
      append: {
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
    errors,
    size,
    confirmButtonText,
    confirmButtonType,
    confirmButtonLoading,
    footerError,
    customStyle,
    elementRef,
    slotsElements,
    callbackMap,
    subscribeMethods,
  }) => {
    const [visible, setVisible] = useState(defaultVisible);
    const { t } = useTranslation();
    const kit = useContext(kitContext);

    const onCancel = useCallback(() => {
      setVisible(false);
      callbackMap?.onCancel?.();
    }, [callbackMap]);

    const footerButtons = (
      <div>
        <kit.button type="text" onClick={onCancel}>
          {t("dovetail.cancel")}
        </kit.button>
        <kit.button
          type={(confirmButtonType || "danger") as ButtonProps["type"]}
          loading={confirmButtonLoading}
          onClick={callbackMap?.onConfirm}
        >
          {confirmButtonText || t("dovetail.delete")}
        </kit.button>
      </div>
    );
    const footer = (
      <FooterWrapper>
        {footerError ? (
          <FooterError>
            <Icon
              className="modal-error-icon"
              type="1-exclamation-error-circle-fill-16-red"
            ></Icon>
            <span className={cx("modal-error-text", Typo.Label.l4_regular)}>
              {footerError}
            </span>
          </FooterError>
        ) : (
          <span />
        )}
        <div>{slotsElements.footer?.({}, footerButtons) || footerButtons}</div>
      </FooterWrapper>
    );
    const content = (
      <>
        {text ? <Text className={Typo.Label.l2_regular}>{text}</Text> : text}
        {tip ? <Tip className={Typo.Label.l4_regular}>{tip}</Tip> : null}
        {errors?.map((error, index) => (
          <ErrorReason className={Typo.Label.l4_regular} key={error + index}>
            {errors.length > 1 ? `${index + 1}. ${error}` : error}
          </ErrorReason>
        ))}
        {slotsElements.append?.({})}
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
      <BaseModal
        getContainer={() =>
          document.getElementById(DIALOG_CONTAINER_ID) || document.body
        }
        visible={visible}
        className={cx(
          CommonModalStyle,
          `size-${size}`,
          css(customStyle?.content))
        }
        title={title}
        width={width}
        footer={footer}
        onCancel={onCancel}
      >
        {slotsElements.content?.({}, content) || content}
      </BaseModal>
    );
  }
);
