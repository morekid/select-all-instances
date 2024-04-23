import IconComponent from "@/src/components/icons/Component";
import IconComponentRemote from "@/src/components/icons/ComponentRemote";
import IconInstance from "@/src/components/icons/Instance";
import IconLoading from "@/src/components/icons/Loading";
import IconNested from "@/src/components/icons/Nested";
import IconUpdateAvailable from "@/src/components/icons/UpdateAvailable";
import IconVariant from "@/src/components/icons/Variant";
import { InstanceItem, MainCompInfo, MsgToFigma } from "@/typings-custom/app";
import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef, memo, useCallback, useEffect, useState } from "react";

import styles from "./ListItem.module.scss";

const cls = cva(["ListItem", styles.ListItem], {
  variants: {
    selected: {
      true: [styles.FigmaSelected],
      false: [],
    },
  },
  defaultVariants: {
    selected: false,
  },
});

const clsInstanceName = cva(styles.InstanceName, {
  variants: {
    visible: {
      true: [],
      false: [styles.FigmaHiddenNode],
    },
  },
  defaultVariants: {
    visible: false,
  },
});

export interface Props extends React.HTMLAttributes<HTMLLIElement> {
  classes?: string[];
  item: InstanceItem;
  mainCompInfo: Partial<MainCompProps>;
  selected?: boolean;
}
const ListItem = forwardRef<HTMLLIElement, Props>(
  ({ classes, item, mainCompInfo, selected, ...props }: Props, ref) => {
    const [hiddenParents, setHiddenParents] = useState<boolean>();

    // Figma: Post
    const figmaSelectInstance = useCallback(() => {
      parent.postMessage(
        {
          pluginMessage: {
            action: "selectNode",
            data: { id: item.id },
          } as MsgToFigma,
        },
        "*",
      );
    }, [item]);

    useEffect(() => {
      const one = item.parents?.some((parent) => parent.visible == false);
      setHiddenParents(one ? true : false);
    }, [item]);

    const getMainComp = useCallback(
      (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        if (!mainCompInfo.info || mainCompInfo.info.imported === undefined) {
          if (item.id) {
            const baseEl = e.currentTarget;
            baseEl.dataset.checkHover = item.id;

            // Wait before getting
            setTimeout(() => {
              // Get if list item is still hovered after a while
              const stillHover = baseEl.parentElement?.querySelector(
                `[data-check-hover="${item.id}"]:hover`,
              );
              if (stillHover) {
                parent.postMessage(
                  {
                    pluginMessage: {
                      action: "getMainComp",
                      data: { id: item.id },
                    } as MsgToFigma,
                  },
                  "*",
                );
              }
            }, 300);
          }
        }
      },
      [mainCompInfo, item],
    );

    return (
      <li
        ref={ref}
        className={cls({
          className: classes,
          selected: selected,
        })}
        onMouseEnter={getMainComp}
        {...props}
      >
        <a
          className={clsInstanceName({
            visible: !hiddenParents && item.visible,
          })}
          title={"Select: " + item.name}
          onClick={figmaSelectInstance}
        >
          <IconInstance />
          <span className={styles.Name}>{item.name}</span>
          {item.parentInstances && (
            <span
              className={styles.Nested}
              title="This instance is nested within another instance."
            >
              <IconNested />
              <span className={styles.NestedText}>
                {item.parentInstances
                  ? item.parentInstances[item.parentInstances.length - 1].name
                  : "Nested"}
              </span>
            </span>
          )}
        </a>
        {mainCompInfo?.info ? (
          <MainComp {...(mainCompInfo as MainCompProps)} />
        ) : (
          <span className={styles.Loading}>
            <IconLoading />
          </span>
        )}
      </li>
    );
  },
);
ListItem.displayName = "ListItem";

export default memo(ListItem);

export interface MainCompProps extends React.HTMLAttributes<HTMLSpanElement> {
  classes?: string[];
  info: MainCompInfo;
}
const MainComp = memo(
  forwardRef<HTMLSpanElement, MainCompProps>(
    ({ classes, info, ...props }: MainCompProps, ref) => {
      const [comp, setComp] = useState<MainCompInfo>(info.imported || info);
      useEffect(() => setComp(info.imported || info), [info]);

      // Figma: Post
      const figmaSelect = useCallback((id?: string) => {
        if (id) {
          parent.postMessage(
            {
              pluginMessage: {
                action: "selectNodeInAnyPage",
                data: { id: id },
              } as MsgToFigma,
            },
            "*",
          );
        }
      }, []);

      return (
        <span
          ref={ref}
          className={`${styles.MainCompInfo}${comp.missing ? " " + styles.Missing : ""}`}
          {...props}
        >
          {comp.parent?.componentSet && (
            <a
              className={`${styles.Variant}${comp.remote ? "" : " " + styles.Link}`}
              title={"Variant: " + comp.name}
              onClick={comp.remote ? undefined : () => figmaSelect(comp.id)}
            >
              <IconVariant />
            </a>
          )}

          {(comp.updated || comp.missing) && (
            <a
              className={`${styles.Component}${comp.remote ? "" : " " + styles.Link}`}
              title={
                (comp.missing
                  ? `(missing${comp.remote ? " or private" : ""}) `
                  : "") +
                (comp.parent?.componentSet ? comp.parent.name : comp.name)
              }
              onClick={
                comp.remote && !comp.missing
                  ? undefined
                  : () =>
                      figmaSelect(
                        comp.parent?.componentSet ? comp.parent.id : comp.id,
                      )
              }
            >
              {comp.remote ? <IconComponentRemote /> : <IconComponent />}
            </a>
          )}

          {!comp.updated && !comp.missing && (
            <span
              className={styles.UpdateAvailable}
              title={
                "(update available) " +
                (comp.parent?.componentSet ? comp.parent?.name : comp.name)
              }
            >
              <IconUpdateAvailable />
            </span>
          )}
        </span>
      );
    },
  ),
);
MainComp.displayName = "MainComp";
