import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-stroke", "icon-cancel"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconCancel = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        {...props}
        fill="none"
        stroke="currentColor"
      >
        <g clip-path="url(#clip0_128_103)">
          <path
            d="M125 64C125 97.6894 97.6894 125 64 125C30.3106 125 3 97.6894 3 64C3 30.3106 30.3106 3 64 3C97.6894 3 125 30.3106 125 64Z"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M93.6984 93.6985L34.3015 34.3015"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M34.3015 93.6985L93.6985 34.3015"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <defs>
          <clipPath id="clip0_128_103">
            <rect width="128" height="128" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
IconCancel.displayName = "IconCancel";

export default IconCancel;
