import React, { useContext } from "react";
import { css, cx } from "@linaria/core";
import { KitContext } from "../../../atoms/kit-context";
import { useTranslation } from "react-i18next";
import { Typo } from "../../../atoms/themes/CloudTower/styles/typo.style";

export const FieldSection = css`
    padding: 7px 0;
    line-height: 18px;
    border-bottom: 1px solid rgba(211, 218, 235, 0.6);
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  
    .section-title-text {
      font-weight: 700;
      color: rgba(44, 56, 82, 0.60);
    }

    &.editor-switch-section-title {
      .section-title-text {
        font-weight: 400;
      }
    }
`;

const EditYAMLTextStyle = css`
  color: rgba(44, 56, 82, 0.60);
  margin-right: 16px;
`;

type SectionTitleProps = {
  isDisplayEditorSwitch?: boolean;
  sectionTitle?: string;
  editorSwitchTooltip?: string;
  isEnableEditor?: boolean;
  isDisabledSwitchEditor?: boolean;
  onEnableEditorChange?: (checked: boolean) => void;
  className?: string;
}

function SectionTitle(props: SectionTitleProps) {
  const {
    isDisplayEditorSwitch,
    sectionTitle,
    editorSwitchTooltip,
    isEnableEditor,
    isDisabledSwitchEditor,
    className,
    onEnableEditorChange,
  } = props;
  const { i18n } = useTranslation();
  const kit = useContext(KitContext);

  return (
    <div className={cx(FieldSection, "field-section-title", isDisplayEditorSwitch ? "editor-switch-section-title" : null, className)}>
      <span className={cx("section-title-text")}>{sectionTitle}</span>
      {isDisplayEditorSwitch ? (
        <span>
          <span className={cx(Typo.Label.l4_regular, EditYAMLTextStyle)}>{i18n.t("dovetail.edit_yaml")}</span>
          <kit.Tooltip title={editorSwitchTooltip}>
            <span>
              <kit.Switch
                disabled={isDisabledSwitchEditor}
                checked={isEnableEditor}
                onChange={onEnableEditorChange}
                size="small"
              ></kit.Switch>
            </span>
          </kit.Tooltip>
        </span>
      ) : null}
    </div>
  )
}

export default SectionTitle;
