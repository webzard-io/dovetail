import { InputNumberProps } from "antd/lib/input-number/index";
import { Typo } from "../../styles/typo.style";
import cs from "classnames";
import { InputNumber as AntdInputNumber } from "antd";
import { InputStyle } from "../Input/Input";

const InputNumber: React.FC<InputNumberProps & { error?: boolean }> = ({
  className,
  error,
  size = "middle",
  ...props
}) => {
  const typo = {
    large: Typo.Label.l2_regular,
    middle: Typo.Label.l3_regular,
    small: Typo.Label.l4_regular,
  }[size];
  return (
    <AntdInputNumber
      {...props}
      size={size}
      data-test={props.name}
      className={cs(className, InputStyle, typo, error ? "error" : "")}
    />
  );
};

export default InputNumber;
