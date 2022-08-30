import React, { useState } from "react";
import { Collapse, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { Typo } from "../styles/typo.style";
import Icon, { IconTypes } from "./Icon/Icon";

const { Panel } = Collapse;

const SummaryListWrapper = styled.div`
  min-width: 190px;
  min-height: 408px;
  overflow: auto;
  border: 1px solid rgba(211, 218, 235, 0.6);
  border-radius: 6px;
`;

const SummaryListTitle = styled.h3`
  padding: 8px 12px;
  color: rgba(44, 56, 82, 0.6);
  background: rgba(237, 241, 250, 0.6);
  box-shadow: inset 0px -1px 0px rgba(211, 218, 235, 0.6);
`;

const SummaryCollapseStyle = css`
  & > .dovetail-ant-collapse-item > .dovetail-ant-collapse-header {
    padding: 10px 12px 10px 12px;
    font-family: "Inter";
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 18px;
    color: #00122e;
  }

  & > .dovetail-ant-collapse-item-active > .dovetail-ant-collapse-header {
    padding-bottom: 8px;
  }

  &
    > .dovetail-ant-collapse-item
    > .dovetail-ant-collapse-content
    > .dovetail-ant-collapse-content-box {
    padding: 0 12px;
  }

  & > .dovetail-ant-collapse-item {
    padding-bottom: 0px;
    border-bottom: 1px solid rgba(225, 230, 241, 0.6);
  }

  & > .dovetail-ant-collapse-item-active {
    padding-bottom: 10px;
  }
`;

const SummaryListBody = styled.div`
  max-height: calc(100vh - 220px);
  overflow: auto;
`;

const SummaryItemsWrapper = styled.div`
  padding: 8px 12px;
`;

const Subheading = styled.h4`
  color: rgba(44, 56, 82, 0.6);
  margin-bottom: 4px;
`;

const ItemDiv = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 18px;
  line-height: 18px;

  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;

const ItemContent = styled.span`
  display: flex;
  flex-shrink: 1;
  min-width: 0;
`;

const Label = styled.span`
  max-width: 100%;
  flex-shrink: 0;
  color: rgba(44, 56, 82, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Value = styled.span`
  flex-shrink: 1;
  color: #00122e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ObjectIcon = styled.span`
  display: flex;
  align-items: center;
  height: 18px;
  margin-right: 4px;
`;

const CloseIcon = styled.span`
  min-width: 18px;
  height: 18px;
  padding: 1px;
  align-self: flex-end;
  margin-left: 4px;

  &:hover {
  }
`;

export type SubHeading = {
  type: "SubHeading";
  title: string;
};

export type Object = {
  type: "Object";
  label: string;
  icon?: IconTypes;
  items: Item[];
};

export type Item = {
  type: "Item";
  label: string;
  value: string | boolean | number;
  removable?: boolean;
};

export type Group = {
  title: string;
  children: (Item | SubHeading | Object)[];
};

function SummaryItem(props: Item) {
  return (
    <ItemDiv>
      <ItemContent title={`${props.label} : ${props.value}`}>
        <Label className={Typo.Label.l4_regular}>{props.label}&nbsp;:&nbsp;</Label>
        <Value className={Typo.Label.l4_regular}>{props.value || ''}</Value>
      </ItemContent>
      {props.removable ? (
        <CloseIcon>
          <Icon type="1-xmark-remove-16-secondary" />
        </CloseIcon>
      ) : null}
    </ItemDiv>
  );
}

function Field(props: Item | Object | SubHeading) {
  if (props.type === "Item") {
    return <SummaryItem key={props.label} {...props}></SummaryItem>;
  } else if (props.type === "SubHeading") {
    return (
      <Subheading key={props.title} className={Typo.Label.l4_bold}>
        {props.title}
      </Subheading>
    );
  } else if (props.type === "Object") {
    return (
      <>
        <ItemDiv>
          <ItemContent title={props.label}>
            {props.icon ? (
              <ObjectIcon>
                <Icon type={props.icon}></Icon>
              </ObjectIcon>
            ) : null}
            <Label className={Typo.Label.l4_regular}>{props.label}</Label>
          </ItemContent>
        </ItemDiv>
        {props.items.map((item) => (
          <SummaryItem key={item.label} {...item}></SummaryItem>
        ))}
      </>
    );
  }

  return null;
}

type Props = {
  title: string;
  defaultWidth?: string;
  groups?: Group[];
  items?: (Item | Object | SubHeading)[];
};

function SummaryList(props: Props) {
  const { title, groups, items, defaultWidth = "190px" } = props;
  const [width, setWidth] = useState(defaultWidth);

  return (
    <SummaryListWrapper style={{ width }}>
      <SummaryListTitle title={title} className={Typo.Label.l2_bold_title}>
        {title}
      </SummaryListTitle>
      <SummaryListBody>
        <Collapse
          className={SummaryCollapseStyle}
          expandIconPosition="right"
          ghost
        >
          {groups && groups.length ? (
            groups.map((group) => (
              <Panel key={group.title} header={group.title}>
                {group.children.map((child) => {
                  return (
                    <Field
                      key={
                        child.type === "SubHeading" ? child.title : child.label
                      }
                      {...child}
                    ></Field>
                  );
                })}
              </Panel>
            ))
          ) : (
            <SummaryItemsWrapper>
              {(items || []).map((item) => (
                <Field
                  key={item.type === "SubHeading" ? item.title : item.label}
                  {...item}
                ></Field>
              ))}
            </SummaryItemsWrapper>
          )}
        </Collapse>
      </SummaryListBody>
    </SummaryListWrapper>
  );
}

export default SummaryList;
