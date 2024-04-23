import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef } from "react";

import styles from "./Action.module.scss";

const cls = cva(styles.Action);

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  classes?: string[];
}
/**
 * Button
 */
const Action = forwardRef<HTMLButtonElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <button
        ref={ref}
        className={cls({
          className: classes,
        })}
        {...props}
      >
        {props.children}
      </button>
    );
  },
);
Action.displayName = "Action";

export default Action;
