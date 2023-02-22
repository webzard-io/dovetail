import React, { useState, useCallback } from "react";
import { Collapse, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { Typo } from "../styles/typo.style";
import Icon, { IconTypes } from "./Icon/Icon";
import registry from "../../../../../services/Registry";
import { Services } from "../../../../organisms/KubectlApplyForm/type";

const { Panel } = Collapse;

const SummaryListWrapper = styled.div`
  min-width: 190px;
  min-height: 408px;
  max-height: 100%;
  border: 1px solid rgba(211, 218, 235, 0.6);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
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
  flex: 1;
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
  line-height: 18px;
  min-height: 18px;

  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;

const ItemContent = styled.span`
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
  vertical-align: top;
`;

const Value = styled.span`
  flex-shrink: 1;
  color: #00122e;
  vertical-align: top;
`;

const ObjectIcon = styled.span`
  display: inline-flex;
  align-items: center;
  height: 18px;
  margin-right: 4px;
  vertical-align: top;
`;

const CloseIcon = styled.span`
  min-width: 18px;
  height: 18px;
  padding: 1px;
  align-self: flex-end;
  margin-left: 4px;
  cursor: pointer;

  &:hover {
  }
`;

type RemovedData = {
  fieldKey: string;
  index: number;
};

export type SubHeading = {
  type: "SubHeading";
  title: string;
};

export type ObjectItem = {
  type: "Object";
  label: string;
  icon?: IconTypes;
  items: Item[];
  removable?: boolean;
  removedData?: RemovedData;
};

export type Item = {
  type: "Item";
  label: string;
  value: string | boolean | number;
  removable?: boolean;
  removedData?: RemovedData;
};

export type Label = {
  type: "Label";
  label: string;
  icon?: IconTypes;
  removable?: boolean;
  removedData?: RemovedData;
};

export type Group = {
  title: string;
  children: (Item | SubHeading | ObjectItem | Label)[];
};

function SummaryItem(props: Item & { services: Services }) {
  const onRemove = useCallback(() => {
    if (props.removedData) {
      props.services.event.emit("remove", props.removedData);
    }
  }, [props]);

  return (
    <ItemDiv>
      <ItemContent title={`${props.label} : ${props.value}`}>
        {props.label ? (
          <Label className={Typo.Label.l4_regular}>
            {props.label}&nbsp;:&nbsp;
          </Label>
        ) : null}
        <Value className={Typo.Label.l4_regular}>{props.value || ""}</Value>
      </ItemContent>
      {props.removable ? (
        <CloseIcon onClick={onRemove}>
          <Icon type="1-xmark-remove-16-secondary" />
        </CloseIcon>
      ) : null}
    </ItemDiv>
  );
}

function SummaryLabel(props: Omit<Label, "type"> & { services: Services }) {
  const icon = registry.icons.get(props.icon || "");

  const onRemove = useCallback(() => {
    if (props.removedData) {
      props.services.event.emit("remove", props.removedData);
    }
  }, [props]);

  return (
    <ItemDiv>
      <ItemContent style={{ display: "flex" }} title={props.label}>
        {icon ? <ObjectIcon>{icon}</ObjectIcon> : null}
        <Label className={Typo.Label.l4_regular}>{props.label}</Label>
      </ItemContent>
      {props.removable ? (
        <CloseIcon onClick={onRemove}>
          <Icon type="1-xmark-remove-16-secondary" />
        </CloseIcon>
      ) : null}
    </ItemDiv>
  );
}

function Field(
  props: (Item | ObjectItem | SubHeading | Label) & { services: Services }
) {
  if (props.type === "Item") {
    return <SummaryItem {...props}></SummaryItem>;
  } else if (props.type === "SubHeading") {
    return (
      <Subheading className={Typo.Label.l4_bold}>{props.title}</Subheading>
    );
  } else if (props.type === "Object") {
    return (
      <>
        {props.label ? <SummaryLabel {...props}></SummaryLabel> : null}
        {props.items.map((item) => (
          <SummaryItem
            key={item.label}
            {...item}
            services={props.services}
          ></SummaryItem>
        ))}
      </>
    );
  } else if (props.type === "Label") {
    return <SummaryLabel {...props}></SummaryLabel>;
  }

  return null;
}

type Props = {
  title: string;
  defaultWidth?: string;
  groups?: Group[];
  items?: (Item | ObjectItem | SubHeading | Label)[];
  services: Services;
};

function SummaryList(props: Props) {
  const { title, groups, items, defaultWidth = "190px", services } = props;
  const [width, setWidth] = useState(defaultWidth);

  return (
    <SummaryListWrapper style={{ width }}>
      <SummaryListTitle title={title} className={Typo.Label.l2_bold_title}>
        {title}
      </SummaryListTitle>
      <SummaryListBody>
        {groups && groups.length ? (
          <Collapse
            className={SummaryCollapseStyle}
            expandIconPosition="right"
            ghost
          >
            {groups.map((group) => (
              <Panel key={group.title} header={group.title}>
                {group.children.map((child, index) => {
                  return (
                    <Field
                      key={`group-${group.title}-${
                        child.type === "SubHeading" ? child.title : child.label
                      }-${index}`}
                      {...child}
                      services={services}
                    ></Field>
                  );
                })}
              </Panel>
            ))}
          </Collapse>
        ) : (
          <SummaryItemsWrapper>
            {(items || []).map((item, idx) => (
              <Field key={idx} {...item} services={services}></Field>
            ))}
          </SummaryItemsWrapper>
        )}
      </SummaryListBody>
    </SummaryListWrapper>
  );
}

export default SummaryList;
