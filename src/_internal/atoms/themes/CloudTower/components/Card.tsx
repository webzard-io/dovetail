import React, { useState } from "react";
import { styled } from "@linaria/react";
import cs from "classnames";

const CardWrapper = styled.div`
  border-radius: 4px;
  background-color: white;
  box-shadow: 0px 0.119595px 0.438513px rgba(129, 138, 153, 0.14),
    0px 0.271728px 0.996336px rgba(129, 138, 153, 0.106447),
    0px 0.472931px 1.73408px rgba(129, 138, 153, 0.0912224),
    0px 0.751293px 2.75474px rgba(129, 138, 153, 0.0799253),
    0px 1.15919px 4.25036px rgba(129, 138, 153, 0.07),
    0px 1.80882px 6.63236px rgba(129, 138, 153, 0.0600747),
    0px 3.00293px 11.0107px rgba(129, 138, 153, 0.0487776),
    0px 6px 22px rgba(129, 138, 153, 0.0335534);
`;

const CardTitle = styled.div`
  color: $text-primary-light;
  padding: 12px 16px 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.has-arrow {
    padding-left: 10px;

    .title-wrapper {
      cursor: pointer;
      color: $text-light-primary;

      &.is-open {
        color: $text-primary-light;
        font-weight: 600;

        .collapse-arrow {
          transform: rotate(90deg);
        }
      }
    }
  }

  .sub-info {
    font-size: 12px;
    line-height: 18px;
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    user-select: none;
    flex-grow: 1;
    font-size: 12px;
    line-height: 18px;
    color: $text-primary-light;
    font-weight: 700;
  }

  .collapse-arrow {
    transition: all 50ms ease-out 0ms;
    margin-right: 2px;
  }
`;

const CardBody = styled.div`
  padding: 0 16px 14px 16px;
`;

export type CardProps = {
  collapsible?: boolean;
  defaultOpen?: boolean;
  title?: React.ReactNode | string;
  subInfo?: React.ReactNode;
  className?: string;
} & React.DOMAttributes<HTMLDivElement>;

const Card: React.FunctionComponent<CardProps> = (props) => {
  const {
    collapsible = false,
    title,
    subInfo,
    className,
    defaultOpen = false,
    ...domProps
  } = props;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <CardWrapper className={cs(["card-wrapper", className])} {...domProps}>
      {title && (
        <CardTitle
          className={cs(["card-title", collapsible ? "has-arrow" : ""])}
        >
          <div
            className={cs(["title-wrapper", open ? "is-open" : ""])}
            onClick={() => {
              collapsible && setOpen(!open);
            }}
          >
            {collapsible && (
              <img
                className="collapse-arrow"
                src={require(`../images/arrow_right_gray.svg`)}
                alt="arrow"
              />
            )}
            {title}
          </div>
          {subInfo && <div className="sub-info">{subInfo}</div>}
        </CardTitle>
      )}
      {(!collapsible || open) && (
        <CardBody className="card-body">{props.children}</CardBody>
      )}
    </CardWrapper>
  );
};

export default Card;
