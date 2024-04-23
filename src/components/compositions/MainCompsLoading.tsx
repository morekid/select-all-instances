import IconLoading from "@/src/components/icons/Loading";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useEffect, useState } from "react";

import styles from "@/src/components/compositions/MainCompsLoading.module.scss";

const cls = cva(styles.MainCompsLoading, {
  variants: {
    hide: {
      true: [styles.Hidden],
      false: [],
    },
  },
  defaultVariants: {},
});

export interface Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cls> {}

const MainCompsLoading = ({ ...props }: Props) => {
  const [toLoad, setToLoad] = useState<number>();

  // DEBUG: Detailed progress
  const [todoDone, setTodoDone] = useState<string>();

  // Figma: Receive
  useEffect(() => {
    const handle = ({ data: { pluginMessage: msg } }: MessageEvent) => {
      if (msg.content == "mainCompRunner") {
        // DEBUG: Detailed progress
        // setTodoDone(msg.data.todo + "/" + msg.data.done);
        setToLoad(msg.data.todo - msg.data.done);
      }
    };

    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  return (
    <div
      className={cls({
        hide: toLoad ? false : true,
      })}
      {...props}
    >
      {toLoad == 0 ? (
        <span>All loaded!</span>
      ) : (
        <>
          <span>
            {toLoad} main comps to load
            {/* DEBUG: Detailed progress {todoDone ? " " + todoDone : ""} */}
          </span>
          <IconLoading />
        </>
      )}
    </div>
  );
};

export default MainCompsLoading;
