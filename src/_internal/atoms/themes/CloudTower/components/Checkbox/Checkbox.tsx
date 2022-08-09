import { CheckboxProps } from 'antd/lib/checkbox';
import React from 'react';
import { Checkbox as AntdCheckbox } from 'antd';
import cs from 'classnames';
import { CheckboxStyle } from './Checkbox.style';
import { Typo } from "../../styles/typo.style";

const Checkbox: React.FC<
  CheckboxProps & {
    description?: React.ReactNode;
    compact?: boolean;
    'data-test'?: string;
  }
> = ({ className, children, description, compact, ...props }) => {
  return (
    <AntdCheckbox
      {...props}
      data-test={props['data-test'] || props.value}
      className={cs(className, CheckboxStyle, compact && 'compact')}
    >
      {children ? (
        <>
          <div className={cs('main', Typo.Label.l2_regular)}>{children}</div>
          {description ? (
            <div className={cs('sub', Typo.Label.l4_regular)}>
              {description}
            </div>
          ) : null}
        </>
      ) : null}
    </AntdCheckbox>
  );
};

export default Checkbox;
