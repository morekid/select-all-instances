import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-nested"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconNested = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        fill="none"
        stroke="currentColor"
        {...props}
      >
        <g clip-path="url(#clip0_122_22)">
          <path
            d="M72.4853 96L96 72.4853L119.515 96L96 119.515L72.4853 96Z"
            vector-effect="non-scaling-stroke"
            stroke-width="0.8"
          />
          <path
            d="M8.48528 32L32 8.48528L55.5147 32L32 55.5147L8.48528 32Z"
            vector-effect="non-scaling-stroke"
            stroke-width="0.8"
          />
          <path
            d="M32 54V96H74"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
            stroke-width="0.8"
          />
        </g>
        <defs>
          <clipPath id="clip0_122_22">
            <rect width="128" height="128" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
IconNested.displayName = "IconNested";

export default IconNested;
