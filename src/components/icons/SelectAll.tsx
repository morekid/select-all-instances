import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-select-all"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconSelectAll = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        stroke="currentColor"
        {...props}
      >
        <path
          d="M33.6667 118H8V10H33.6667M94.3 10H119.967V118H94.3"
          stroke-width="0.8"
          vector-effect="non-scaling-stroke"
          stroke-miterlimit="10"
        />
        <path
          d="M40.4853 64L64 40.4853L87.5147 64L64 87.5147L40.4853 64Z"
          stroke-width="0.8"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    );
  },
);
IconSelectAll.displayName = "IconSelectAll";

export default IconSelectAll;
