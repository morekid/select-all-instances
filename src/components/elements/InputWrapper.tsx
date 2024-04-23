import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef } from "react";

import styles from "./InputWrapper.module.scss";

const cls = cva(["InputWrapper", styles.InputWrapper], {
  variants: {
    intent: {
      block: [styles.Block],
      inline: [styles.Inline],
    },
  },
  defaultVariants: { intent: "inline" },
});

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  classes?: string[];
  layout?: "block" | "inline";
}
const InputWrapper = forwardRef<HTMLDivElement, Props>(
  ({ classes, layout, ...props }: Props, ref) => {
    return (
      <div
        ref={ref}
        className={cls({
          className: classes,
          intent: layout == "block" ? "block" : "inline",
        })}
        {...props}
      >
        {props.children}
      </div>
    );
  },
);
InputWrapper.displayName = "InputWrapper";

export default InputWrapper;

/**
 * Input detail
 * Use after the input control as detail content.
 */
const clsDetail = cva(styles.Detail);

export interface DetailProps extends React.HTMLAttributes<HTMLDivElement> {
  classes?: string[];
}
export const Detail = forwardRef<HTMLDivElement, DetailProps>(
  ({ classes, ...props }: DetailProps, ref) => {
    return (
      <div
        ref={ref}
        className={clsDetail({
          className: classes,
        })}
        {...props}
      >
        {typeof props.children == "string" ? (
          <p>{props.children}</p>
        ) : (
          props.children
        )}
      </div>
    );
  },
);
