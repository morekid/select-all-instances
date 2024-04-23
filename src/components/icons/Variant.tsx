import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-fill", "icon-variant"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconInstance = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        stroke="none"
        fill="currentColor"
        {...props}
      >
        <path d="M20 64.4119L64.4119 20L108.824 64.4119L64.4119 108.824L20 64.4119Z" />
      </svg>
    );
  },
);
IconInstance.displayName = "IconInstance";

export default IconInstance;
