import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { ReactNode, forwardRef } from "react";

import styles from "./Button.module.scss";

const cls = cva(styles.Button, {
  variants: {
    intent: {
      primary: [styles.RolePrimary],
      secondary: [styles.RoleSecondary],
    },
    state: {
      off: [],
      on: [styles.On],
    },
    body: {
      default: [],
      iconOnly: [styles.IconOnly],
    },
    decoratorPos: {
      left: [styles.StartDecorator],
      right: [styles.EndDecorator],
      none: [],
    },
  },
  defaultVariants: {
    intent: "primary",
    state: "off",
    body: "default",
    decoratorPos: "none",
  },
});

export interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cls> {
  classes?: string[];
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}
/**
 * Button
 */
const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      classes,
      startDecorator,
      endDecorator,
      body,
      intent,
      state,
      ...props
    }: Props,
    ref,
  ) => {
    const click = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      (e.currentTarget as HTMLElement).blur();
      props.onClick && props.onClick(e);
    };

    return (
      <button
        ref={ref}
        className={cls({
          className: classes,
          body,
          intent,
          state,
          decoratorPos: startDecorator ? "left" : endDecorator ? "right" : null,
        })}
        {...props}
        onClick={click}
      >
        {startDecorator}
        <span>{props.children}</span>
        {endDecorator}
      </button>
    );
  },
);
Button.displayName = "Button";

export default Button;
