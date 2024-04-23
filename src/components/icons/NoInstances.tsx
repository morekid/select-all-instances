import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-no-instances"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconNoInstances = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        stroke="currentColor"
        {...props}
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-width="0.8"
          d="M9 119L119 9.00001"
        />
        <path
          vector-effect="non-scaling-stroke"
          stroke-width="0.8"
          d="M14.2426 64L64 14.2426L113.757 64L64 113.757L14.2426 64Z"
        />
      </svg>
    );
  },
);
IconNoInstances.displayName = "IconNoInstances";

export default IconNoInstances;
