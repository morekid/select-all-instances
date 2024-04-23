import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-fill", "icon-loading"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconLoading = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cls({ className: classes })}
        stroke="none"
        fill="currentColor"
        {...props}
      >
        <circle cx="18" cy="12" r="0">
          <animate
            attributeName="r"
            begin=".67"
            calcMode="spline"
            dur="1.5s"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
            repeatCount="indefinite"
            values="0;2;0;0"
          />
        </circle>
        <circle cx="12" cy="12" r="0">
          <animate
            attributeName="r"
            begin=".33"
            calcMode="spline"
            dur="1.5s"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
            repeatCount="indefinite"
            values="0;2;0;0"
          />
        </circle>
        <circle cx="6" cy="12" r="0">
          <animate
            attributeName="r"
            begin="0"
            calcMode="spline"
            dur="1.5s"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
            repeatCount="indefinite"
            values="0;2;0;0"
          />
        </circle>
      </svg>
    );
  },
);
IconLoading.displayName = "IconLoading";

export default IconLoading;
