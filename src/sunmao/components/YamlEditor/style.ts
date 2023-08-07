import { css } from "@linaria/core";

// TODO: use sass variables

export const ToolBarStyle = css`
  width: 100%;
  padding: 11px;
  border-top: 1px solid rgba(211, 218, 235, 0.6);
  border-bottom: 1px solid rgba(211, 218, 235, 0.6);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background: rgba(225, 230, 241, 0.6);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;

  & svg {
    margin: auto;
  }

  & > .dovetail-ant-space-item {
    line-height: 16px;
  }
`;
export const ToolBarHeaderStyle = css`
  display: flex;
  width: 100%;
  height: 20px;
  justify-content: space-between;
`;
export const ErrorIconStyle = css`
  margin-top: 1px;
`;
export const WrapperStyle = css`
  width: 100%;
  border: 1px solid rgba(211, 218, 235, 0.6);
  border-top: 0;
  border-radius: 8px;
  overflow: auto;

  &.collapsed {
    border-bottom: 0;
  }

  &[data-is-error='true'] {
    border-color: #F0483E;

    & .${ToolBarStyle} {
      padding-bottom: 7px;
      background: #ffecec;
    }
  }
`;

export const TitleStyle = css`
  color: #00122E;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
`;

export const IconStyle = css`
  cursor: pointer;
  margin: auto 0;

  &.arrow-down svg {
    transform: rotate(90deg);
  }

  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: .5;
  }
`;

export const DisabledIconStyle = css`
  fill: rgba(#2C3852, 0.6);
  cursor: not-allowed;
`;

export const PlainCodeStyle = css`
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  padding-left: 62px;
  overflow: auto;
`;

export const ErrorMsgStyle = css`
  color: #F0483E;
  font-size: 12px;
  line-height: 18px;
  word-break: break-all;
`;

export const ErrorWrapperStyle = css`
  margin-top: 8px;
`;
