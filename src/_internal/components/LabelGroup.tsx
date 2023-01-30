import React, { useContext, useCallback, useState } from "react";
import { KitContext } from "../atoms/kit-context";
import { useTranslation } from "react-i18next";
import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";
import _ from "lodash";
import { Typo } from "../atoms/themes/CloudTower/styles/typo.style";
import LabelTag from "./LabelTag";

const LabelTabWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  justify-content: center;
  height: 100%;

  .label-card-wrapper {
    width: 592px;
  }

  &.with-margin-top .label-card-wrapper {
    margin-top: 24px;
  }
`;

const LabelCardWrapper = styled.div`
  .card-content {
    display: flex;
    border-radius: 8px;
    background-color: white;
    align-items: flex-start;

    &.empty {
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .text {
        width: 100%;
        text-align: center;
        color: $text-light-tertiary;
      }

      .ant-btn {
        margin-top: 8px;
        padding: 2px 8px;
        color: $text-light-super;
      }
    }

    > .icon-wrapper {
      margin-right: 10px;
    }

    .tags-wrapper {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      width: 100%;

      .ant-btn {
        margin-right: 8px;
      }
    }
  }
`;

const TriggerStyle = css`
  padding: 0;
  width: 24px !important;
  height: 24px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  .icon-wrapper {
    margin-right: 0;
  }
`;

const InputsWrapper = styled.div`
  display: inline-flex;
  width: 128px;
  white-space: pre;
`;

export type Label = {
  key: string;
  value?: string;
};

type Validator = {
  validate: (value: string) => null | string;
};

type ValidateError = {
  code: string | null;
};

export type LabelGroupProps = {
  className?: string;
  labels: Label[];
  loading?: boolean;
  hasMargin?: boolean;
  editable?: boolean;
  keyValidators?: Validator[];
  valueValidators?: Validator[];
  onChange?: (labels: Label[]) => void;
  onEditedKeyChange?: (value: string, errors: ValidateError[]) => void;
  onEditedValueChange?: (value: string, errors: ValidateError[]) => void;
};

function runValidators(
  value: string,
  validators?: Validator[]
): ValidateError[] {
  return (validators || [])
    .map(({ validate }) => validate(value))
    .filter<string>((error): error is string => !!error)
    .map((code) => ({ code }));
}

const LabelGroup = React.forwardRef<HTMLDivElement, LabelGroupProps>(
  function LabelGroup(
    {
      className,
      labels,
      loading,
      hasMargin,
      editable = true,
      keyValidators,
      valueValidators,
      onChange,
      onEditedKeyChange,
      onEditedValueChange,
    },
    ref
  ) {
    const kit = useContext(KitContext);
    const [editing, setEditing] = useState(false);
    const [editedKey, setEditedKey] = useState("");
    const [editedValue, setEditedValue] = useState("");

    const onClickAdd = useCallback(() => {
      setEditing(true);
    }, []);
    const onEditedKeyChangeHandler = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const errors = runValidators(value, keyValidators);

        setEditedKey(value);
        onEditedKeyChange?.(value, errors);
      },
      [onEditedKeyChange, keyValidators]
    );
    const onEditedValueChangeHandler = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const errors = runValidators(value, valueValidators);

        setEditedValue(value);
        onEditedValueChange?.(value, errors);
      },
      [onEditedValueChange, valueValidators]
    );
    const onInputKeyUp = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
          case "Enter": {
            if (
              runValidators(editedKey, keyValidators).length ||
              runValidators(editedValue, valueValidators).length
            ) {
              return;
            }

            const newLabels = labels.concat({
              key: editedKey,
              value: editedValue,
            });

            onChange?.(newLabels);
            setEditing(false);
            setEditedKey("");
            setEditedValue("");
            break;
          }
          case "Escape": {
            setEditing(false);
            setEditedKey("");
            setEditedValue("");
            break;
          }
        }
      },
      [labels, editedKey, editedValue, onChange]
    );

    return (
      <LabelTabWrapper
        className={hasMargin ? `with-margin-top ${className}` : ""}
        ref={ref}
      >
        <LabelCardWrapper className="label-card-wrapper">
          {loading ? (
            <kit.Loading />
          ) : (
            <div className="card-content">
              <div className="tags-wrapper">
                {labels.map((label) => {
                  return (
                    <LabelTag
                      key={label.key}
                      label={label}
                      showEllipsis={true}
                      remove={
                        editable
                          ? () => {
                              onChange?.(
                                labels.filter(({ key }) => label.key !== key)
                              );
                            }
                          : undefined
                      }
                    />
                  );
                })}
                {editing ? (
                  <InputsWrapper>
                    <kit.Input
                      type="default"
                      value={editedKey}
                      size="small"
                      onChange={onEditedKeyChangeHandler}
                      onKeyUp={onInputKeyUp}
                    ></kit.Input>
                    :{" "}
                    <kit.Input
                      type="default"
                      value={editedValue}
                      size="small"
                      onChange={onEditedValueChangeHandler}
                      onKeyUp={onInputKeyUp}
                    ></kit.Input>
                  </InputsWrapper>
                ) : null}
                {editable && editing === false ? (
                  <kit.Button
                    className={TriggerStyle}
                    prefixIcon="1-plus-add-create-new-16-secondary"
                    hoverPrefixIcon="1-plus-add-create-new-16-blue"
                    onClick={onClickAdd}
                  ></kit.Button>
                ) : null}
              </div>
            </div>
          )}
        </LabelCardWrapper>
      </LabelTabWrapper>
    );
  }
);

export default LabelGroup;
