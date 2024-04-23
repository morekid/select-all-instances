import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef, memo, useCallback, useEffect, useRef } from "react";

import { MsgToFigma } from "@/typings-custom/app";
import styles from "./ResizeHandler.module.scss";

const cls = cva(["ResizeHandler", styles.ResizeHandler], {
  variants: {},
  defaultVariants: {},
});

export interface Props
  extends React.HTMLAttributes<HTMLDivElement>,
    React.PropsWithChildren,
    VariantProps<typeof cls> {
  classes?: string[];
}
const ResizeHandler = forwardRef<HTMLDivElement, Props>(
  ({ classes, ...props }: Props, ref) => {
    const tRef = useRef<HTMLDivElement>(null);
    const trRef = useRef<HTMLDivElement>(null);
    const rRef = useRef<HTMLDivElement>(null);
    const brRef = useRef<HTMLDivElement>(null);
    const bRef = useRef<HTMLDivElement>(null);
    const blRef = useRef<HTMLDivElement>(null);
    const lRef = useRef<HTMLDivElement>(null);
    const tlRef = useRef<HTMLDivElement>(null);

    const resize = useCallback((e: PointerEvent) => {
      const dir = (e.target as HTMLElement).dataset.name;
      const width =
        dir == "right" || dir == "bottomRight" ? Math.floor(e.clientX) : null;
      const height =
        dir == "bottom" || dir == "bottomRight" ? Math.floor(e.clientY) : null;

      parent.postMessage(
        {
          pluginMessage: {
            action: "resize",
            data: {
              handle: dir,
              currentSize: { width, height },
            },
          } as MsgToFigma,
        },
        "*",
      );
    }, []);

    const handleOn = useCallback((e: PointerEvent) => {
      if (e.target) {
        (e.target as HTMLElement).onpointermove = resize;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    }, []);

    const handleOff = useCallback((e: PointerEvent) => {
      if (e.target) {
        (e.target as HTMLElement).onpointermove = null;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    }, []);

    useEffect(() => {
      if (rRef.current) {
        rRef.current.onpointerdown = handleOn;
        rRef.current.onpointerup = handleOff;
      }
      return () => {
        if (rRef.current) {
          rRef.current.onpointerdown = null;
          rRef.current.onpointerup = null;
        }
      };
    }, [rRef]);

    useEffect(() => {
      if (bRef.current) {
        bRef.current.onpointerdown = handleOn;
        bRef.current.onpointerup = handleOff;
      }
      return () => {
        if (bRef.current) {
          bRef.current.onpointerdown = null;
          bRef.current.onpointerup = null;
        }
      };
    }, [bRef]);

    useEffect(() => {
      if (brRef.current) {
        brRef.current.onpointerdown = handleOn;
        brRef.current.onpointerup = handleOff;
      }
      return () => {
        if (brRef.current) {
          brRef.current.onpointerdown = null;
          brRef.current.onpointerup = null;
        }
      };
    }, [brRef]);

    return (
      <>
        <div className={cls()} {...props}>
          {/* <div
            ref={tRef}
            data-name="top"
            className={`${styles.Handle} ${styles.Top}`}
          ></div> */}
          {/* <div
            ref={trRef}
            data-name="topRight"
            className={`${styles.Handle} ${styles.TopRight}`}
          ></div> */}
          <div
            ref={rRef}
            data-name="right"
            className={`${styles.Handle} ${styles.Right}`}
          ></div>
          <div
            ref={brRef}
            data-name="bottomRight"
            className={`${styles.Handle} ${styles.BottomRight}`}
          ></div>
          <div
            ref={bRef}
            data-name="bottom"
            className={`${styles.Handle} ${styles.Bottom}`}
          ></div>
          {/* <div
            ref={blRef}
            data-name="bottomLeft"
            className={`${styles.Handle} ${styles.BottomLeft}`}
          ></div> */}
          {/* <div
            ref={lRef}
            data-name="left"
            className={`${styles.Handle} ${styles.Left}`}
          ></div> */}
          {/* <div
            ref={tlRef}
            data-name="topLeft"
            className={`${styles.Handle} ${styles.TopLeft}`}
          ></div> */}
        </div>
        {props.children}
      </>
    );
  },
);
ResizeHandler.displayName = "ResizeHandler";

export default memo(ResizeHandler);
