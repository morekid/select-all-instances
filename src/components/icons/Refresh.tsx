import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-refresh"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconRefresh = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        stroke="currentColor"
        {...props}
      >
        <path
          d="M113 64C113 34.1766 88.8234 10 59 10C29.1766 10 5 34.1766 5 64C5 93.8234 29.1766 118 59 118"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <path
          d="M101.486 59.3137L112.8 70.6274L124.114 59.3137"
          stroke-width="0.8"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
    );
  },
);
IconRefresh.displayName = "IconRefresh";

export default IconRefresh;
