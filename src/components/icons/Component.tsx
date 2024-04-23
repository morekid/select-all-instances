import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-fill", "icon-component"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconComponent = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        stroke="none"
        fill="currentColor"
        {...props}
      >
        <g clip-path="url(#clip0_103_104)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M53.1632 64L26.5816 90.5816L0 64L26.5816 37.4184L53.1632 64ZM90.5816 26.5816L64 53.1632L37.4184 26.5816L64 0L90.5816 26.5816ZM128 64L101.418 90.5816L74.8368 64L101.418 37.4184L128 64ZM90.5816 101.418L64 128L37.4184 101.418L64 74.8368L90.5816 101.418Z"
          />
        </g>
        <defs>
          <clipPath id="clip0_103_104">
            <rect width="128" height="128" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
IconComponent.displayName = "IconComponent";

export default IconComponent;
