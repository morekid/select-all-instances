import IconComponent from "@/src/components/icons/Component";
import IconInstance from "@/src/components/icons/Instance";
import { randSeededNum } from "@/src/utils/utils";
import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import styles from "./ListItemLoading.module.scss";

const cls = cva(styles.ListItemLoading);
const clsInstanceName = cva(styles.InstanceName, {
  variants: {},
  defaultVariants: {
    visible: false,
  },
});

export interface Props extends React.HTMLAttributes<HTMLLIElement> {
  classes?: string[];
  order: { index: number; total: number };
}
const ListItemLoading = forwardRef<HTMLLIElement, Props>(
  ({ classes, order, ...props }: Props, ref) => {
    const animDelay = (order.index * 0.0015).toFixed(1) + "s";
    const opacity = 1 - order.index / order.total;
    const width =
      randSeededNum(order.index, new Date().getHours() / 100) * 50 + "%";

    // Get ref
    let elRef = useRef<HTMLLIElement>(null);
    useImperativeHandle<HTMLLIElement | null, HTMLLIElement | null>(
      ref,
      () => elRef.current,
    );

    let nameRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (elRef.current && nameRef.current) {
        elRef.current.style.opacity = opacity.toString();
        elRef.current.style.setProperty("--anim-delay", animDelay);
        nameRef.current.style.width = width;
      }
    }, [elRef, nameRef]);

    return (
      <li
        ref={elRef}
        className={cls({
          className: classes,
        })}
        {...props}
      >
        <a className={clsInstanceName()}>
          <IconInstance />
          <span ref={nameRef} className={styles.Name}>
            &nbsp;
          </span>
        </a>
        <MainCompInfo />
      </li>
    );
  },
);
ListItemLoading.displayName = "ListItemLoading";

export default ListItemLoading;

export interface MainCompInfoProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  classes?: string[];
}
const MainCompInfo = forwardRef<HTMLSpanElement, MainCompInfoProps>(
  ({ classes, ...props }: MainCompInfoProps, ref) => {
    return (
      <span ref={ref} className={styles.MainCompInfo} {...props}>
        <IconComponent />
      </span>
    );
  },
);
