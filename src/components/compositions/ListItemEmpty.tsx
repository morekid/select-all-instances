import IconNoInstances from "@/src/components/icons/NoInstances";
import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef } from "react";

import styles from "./ListItemEmpty.module.scss";

const cls = cva(styles.ListItemEmpty, {
  variants: {
    visible: {
      true: [styles.Visible],
      false: [],
    },
  },
  defaultVariants: {
    visible: false,
  },
});

export interface Props extends React.HTMLAttributes<HTMLLIElement> {
  classes?: string[];
}
const ListItemEmpty = forwardRef<HTMLLIElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    return (
      <li
        ref={ref}
        className={cls({
          className: classes,
        })}
        {...props}
      >
        <IconNoInstances />
        <span className={styles.Title}>No instances.</span>
        <span className={styles.Detail}>
          Check your filters or your page content.
        </span>
      </li>
    );
  },
);
ListItemEmpty.displayName = "ListItemEmpty";

export default ListItemEmpty;
