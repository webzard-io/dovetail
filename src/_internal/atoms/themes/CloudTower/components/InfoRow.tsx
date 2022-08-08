import { styled } from "@linaria/react";

const Col = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  font-size: 12px;
  line-height: 18px;
  padding: 8px 0;
  box-shadow: inset 0px -1px 0px rgba(213, 219, 227, 0.6);

  &:last-of-type {
    box-shadow: none;
    padding-bottom: 0;
  }
  &.collapsed {
    flex-direction: column;

    .collapsed-content {
      display: flex;

      > span {
        flex: 1;
        display: flex;
        justify-content: space-between;
        .ant-btn {
          height: auto;
        }
      }
    }
    .extra-content {
      margin-left: 162px;
    }
  }

  .col-label {
    width: 150px;
    color: $text-secondary-light;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .col-content {
    color: $text-primary-light;

    /* make btn link in info row have the same height as normal text */
    .ant-btn-link {
      height: auto;
    }
  }
`;

const InfoRow: React.FC<{
  label: React.ReactNode;
  content: boolean | {} | string | number | JSX.Element;
  className?: string;
}> = ({ label, content, className }) => {
  return (
    <Col className={className}>
      <div className="col-label">{label}</div>
      <div className="col-content">{content}</div>
    </Col>
  );
};

export default InfoRow;
