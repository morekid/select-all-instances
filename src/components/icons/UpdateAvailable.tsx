import { cva } from "class-variance-authority";
import * as React from "react";
import { PropsWithChildren, forwardRef } from "react";

const cls = cva(["icon", "icon-fill", "icon-update-available"]);

export interface Props extends PropsWithChildren {
  classes?: string[];
}

const IconUpdateAvailable = forwardRef<HTMLOrSVGElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <svg
        viewBox="0 0 128 128"
        className={cls({ className: classes })}
        fill="currentColor"
        {...props}
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M115.541 31.0595L118.453 11.9534L128 13.4151L122.678 48.3777L122.673 48.3694L83.4885 45.8422L84.1131 36.198L108.324 37.7637C99.3418 22.6315 82.8526 12.5107 63.9972 12.5075C35.545 12.5095 12.4861 35.5748 12.5001 64.0089L2.82867 64.0136C2.82686 30.2277 30.2198 2.8414 63.9973 2.84442C85.6529 2.84097 104.677 14.0963 115.541 31.0595ZM12.4552 96.9637L9.54247 116.073L0 114.62L5.32188 79.6573L44.5067 82.1845L43.8904 91.8239L19.6727 90.262C28.6561 105.389 45.1445 115.524 64.0028 115.528C92.4501 115.517 115.514 92.4602 115.503 64.0129L125.166 64.013C125.168 97.7989 97.7754 125.185 63.9979 125.182C42.3413 125.186 23.323 113.925 12.4552 96.9637Z"
        />
      </svg>
    );
  },
);
IconUpdateAvailable.displayName = "IconUpdateAvailable";

export default IconUpdateAvailable;
