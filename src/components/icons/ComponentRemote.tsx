import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-component-remote"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconComponentRemote = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        fill="currentColor"
        {...props}
      >
        <g clip-path="url(#clip0_105_108)">
          <path
            vector-effect="non-scaling-stroke"
            stroke-width="1"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.1571 62.0641L65.9448 6.26758L59.6772 0L3.88953 55.7965C-1.29651 60.9914 -1.29651 69.4132 3.88953 74.5993L53.4185 124.11C58.6045 129.305 67.0263 129.305 72.2124 124.11L128 68.3317L121.732 62.0641L65.9536 117.843C64.2161 119.572 61.4147 119.572 59.6861 117.843L10.1571 68.3317C8.42843 66.603 8.41957 63.7928 10.1571 62.0641ZM111.591 12.0033H80.5632V20.8683H100.891L64.1274 57.6227L70.395 63.8903L107.141 27.1359V47.4634H116.006V12.0033H111.573H111.591Z"
          />
        </g>
        <defs>
          <clipPath id="clip0_105_108">
            <rect width="128" height="128" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
IconComponentRemote.displayName = "IconComponentRemote";

export default IconComponentRemote;
