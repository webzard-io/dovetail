import React, { useContext } from "react";
import { css, cx } from "@linaria/core";
import { kitContext } from "@cloudtower/eagle";
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
  isDisplayEditorSwitch: boolean;
  sectionTitle?: string;
  editorSwitchTooltip?: string;
  isEnableEditor?: boolean;
  isDisabledSwitchEditor?: boolean;
  onEnableEditorChange?: (checked: boolean) => void;
}

function SectionTitle(props: SectionTitleProps) {
  const {
    isDisplayEditorSwitch,
    sectionTitle,
    editorSwitchTooltip,
    isEnableEditor,
    isDisabledSwitchEditor,
    onEnableEditorChange
  } = props;
  const { i18n } = useTranslation();
  const kit = useContext(kitContext);

  return (
    <div className={cx(FieldSection, "field-section-title", isDisplayEditorSwitch ? "editor-switch-section-title" : null)}>
      <span className={cx("section-title-text")}>{sectionTitle}</span>
      {isDisplayEditorSwitch ? (
        <span>
          <span className={cx(Typo.Label.l4_regular, EditYAMLTextStyle)}>{i18n.t("dovetail.edit_yaml")}</span>
          <kit.tooltip title={editorSwitchTooltip}>
            <span>
              <kit.switch
                disabled={isDisabledSwitchEditor}
                checked={isEnableEditor}
                onChange={onEnableEditorChange}
                size="small"
              ></kit.switch>
            </span>
          </kit.tooltip>
        </span>
      ) : null}
    </div>
  )
}

export default SectionTitle;
