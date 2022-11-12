import React, { useContext } from "react";
import { styled } from "@linaria/react";
import { cx } from "@linaria/core";
import { KitContext } from "./atoms/kit-context";
import { useTranslation } from "react-i18next";
import { Typo } from "./atoms/themes/CloudTower/styles/typo.style";

export const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    margin-bottom: 8px;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(211.41deg, #929dad 0%, #d3dbe3 100%);
  }
`;

export type WidgetErrorContentProps = {
  errorText?: string;
  style?: React.CSSProperties;
  refetch?: () => void;
};

const WidgetErrorContent: React.FunctionComponent<WidgetErrorContentProps> = (
  props
) => {
  const { refetch } = props;
  const kit = useContext(KitContext);
  const { t } = useTranslation();

  return (
    <ErrorWrapper style={props.style}>
      <ErrorContent>
        <p className={cx(Typo.Label.l1_regular_title, "title")}>
          {props.errorText || t("dovetail.obtain_data_error")}
        </p>
        {refetch ? (
          <kit.Button
            type="ordinary"
            onClick={(e) => {
              e.stopPropagation();
              refetch?.();
            }}
          >
            {t("dovetail.retry")}
          </kit.Button>
        ) : null}
      </ErrorContent>
    </ErrorWrapper>
  );
};

export default WidgetErrorContent;
