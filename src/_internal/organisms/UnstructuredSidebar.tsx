import React, { useContext } from "react";
import { css } from "@emotion/css";
import { KitContext, SidebarProps } from "../../_internal/atoms/kit-context";
import ObjectMeta from "../../_internal/molecules/ObjectMeta";
import ObjectSpec from "../../_internal/molecules/ObjectSpec";
import ObjectStatus from "../../_internal/molecules/ObjectStatus";

type UnstructuredSidebarProps = {
  item: any;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  toolbar?: React.ReactNode;
  onClose?: () => void;
  getContainer: SidebarProps["getContainer"];
};

const Header = css`
  display: flex;
  line-height: 22px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3a56;
  margin: 16px 0;
`;

const Toolbar = css`
  margin-bottom: 16px;
`;

const CardWrapper = css`
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
  margin-bottom: 40px;

  .card-body {
    padding: 8px 16px;
  }
`;

const UnstructuredSidebar = React.forwardRef<
  HTMLDivElement,
  UnstructuredSidebarProps
>(({ item, visible, toolbar, onVisibleChange, onClose, getContainer }, ref) => {
  const kit = useContext(KitContext);

  return (
    <kit.Sidebar
      visible={visible}
      onClose={() => {
        onVisibleChange(false);
        onClose?.();
      }}
      ref={ref}
      getContainer={getContainer}
      width={600}
    >
      <div className={Header}>{item?.metadata?.name}</div>
      <div className={Toolbar}>{toolbar}</div>
      <div className={CardWrapper}>
        <div className="card-body">
          <ObjectMeta item={item} />
        </div>
      </div>
      <div className={Header}>Spec</div>
      <div className={CardWrapper}>
        <div className="card-body">
          <ObjectSpec item={item} />
        </div>
      </div>
      <div className={Header}>Status</div>
      <div className={CardWrapper}>
        <div className="card-body">
          <ObjectStatus item={item} />
        </div>
      </div>
    </kit.Sidebar>
  );
});

export default UnstructuredSidebar;
