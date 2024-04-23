import InputWrapper, {
  Detail,
  Props as InputWrapperProps,
} from "@/src/components/elements/InputWrapper";
import { cva } from "class-variance-authority";
import * as React from "react";
import { ReactNode, forwardRef, useEffect, useState } from "react";

import styles from "./Checkbox.module.scss";

const cls = cva(["Checkbox", styles.Checkbox], {
  variants: {
    checked: {
      true: [styles.Checked],
      false: [],
    },
    disabled: {
      true: [styles.Disabled],
      false: [],
    },
  },
  defaultVariants: {
    checked: false,
  },
});

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  classes?: string[];
  inputWrapper?: InputWrapperProps;
  label?: string | ReactNode;
  detail?: string | ReactNode;
}
const Checkbox = forwardRef<HTMLInputElement, Props>(
  ({ classes, inputWrapper, label, detail, ...props }: Props, ref) => {
    const [checked, setChecked] = useState(false);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
      props.checked != undefined && setChecked(props.checked);
    }, [props.checked]);

    useEffect(() => {
      props.disabled != undefined && setDisabled(props.disabled);
    }, [props.disabled]);

    return (
      <InputWrapper layout="block" {...inputWrapper}>
        <div>
          <label className={cls({ checked, disabled })}>
            <input
              ref={ref}
              className={styles.Input}
              type="checkbox"
              onChange={(e) => {
                e.target.blur();
                setChecked(e.target.checked);
              }}
              {...props}
            />
            <span className={"Label " + styles.Label}>{label}</span>
          </label>
        </div>
        {detail && <Detail>{detail}</Detail>}
      </InputWrapper>
    );
  },
);
Checkbox.displayName = "Checkbox";

export default Checkbox;
