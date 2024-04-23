import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-fill", "icon-filter"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconFilter = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        fill="currentColor"
        {...props}
      >
        {" "}
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M69.038 70.384L69.038 116.747C69.038 119.508 66.7994 121.747 64.038 121.747C61.2766 121.747 59.038 119.508 59.038 116.747L59.038 70.384L13 9H115.076L69.038 70.384Z"
        />
      </svg>
    );
  },
);
IconFilter.displayName = "IconFilter";

export default IconFilter;
