import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-instance"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconInstance = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        fill="none"
        stroke="currentColor"
        {...props}
      >
        <g clip-path="url(#clip0_103_105)">
          <path
            d="M8.48528 64L64 8.48528L119.515 64L64 119.515L8.48528 64Z"
            vector-effect="non-scaling-stroke"
            stroke-width="1"
          />
        </g>
        <defs>
          <clipPath id="clip0_103_105">
            <rect width="128" height="128" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
IconInstance.displayName = "IconInstance";

export default IconInstance;
