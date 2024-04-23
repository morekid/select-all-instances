import Action from "@/src/components/elements/Action";
import InputWrapper, {
  Props as InputWrapperProps,
} from "@/src/components/elements/InputWrapper";
import IconCancel from "@/src/components/icons/Cancel";
import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./InputText.module.scss";

const cls = cva(["InputText", styles.InputText]);

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  classes?: string[];
  inputWrapper?: InputWrapperProps;
  onChangeValue?: Function;
  clearValue: boolean;
}
const InputText = forwardRef<HTMLInputElement, Props>(
  (
    { classes, inputWrapper, onChangeValue, clearValue, ...props }: Props,
    ref,
  ) => {
    const [value, setValue] = useState<string>("");

    useEffect(() => {
      onChangeValue && onChangeValue(value);
    }, [value]);

    /**
     * Reset value
     */
    useEffect(() => {
      if (clearValue) {
        setValue("");
      }
    }, [clearValue]);

    const setWidth = (el: EventTarget) => {
      // TODO: improve content fit
      // const input = el as HTMLInputElement;
      // input.style.width = input.value.length + "em";
    };

    return (
      <InputWrapper {...inputWrapper}>
        <input
          className={cls()}
          ref={ref}
          type="text"
          onChange={(e) => {
            setValue(e.target.value);
            setWidth(e.target);
          }}
          onKeyDown={(e) => setWidth(e.target)}
          value={value}
          {...props}
        />
        {value && value != "" && (
          <ActionCancel
            onClick={() => {
              setValue("");
            }}
          />
        )}
      </InputWrapper>
    );
  },
);
InputText.displayName = "InputText";

export default InputText;

/**
 * Action: Cancel
 * Small action button for inline/embedded use, with a cancel icon.
 */
const clsActionCancel = cva(styles.ActionCancel);

export interface ActionCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  classes?: string[];
}
export const ActionCancel = forwardRef<HTMLButtonElement, ActionCancelProps>(
  ({ classes, ...props }: ActionCancelProps, ref) => {
    return (
      <Action ref={ref} classes={[clsActionCancel()]} {...props}>
        <IconCancel />
      </Action>
    );
  },
);
