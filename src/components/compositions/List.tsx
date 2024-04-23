import ListItem from "@/src/components/compositions/ListItem";
import ListItemEmpty from "@/src/components/compositions/ListItemEmpty";
import ListItemLoading from "@/src/components/compositions/ListItemLoading";
import { getComparator } from "@/src/utils/utils";
import { InstanceItem } from "@/typings-custom/app";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useEffect, useState } from "react";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import VirtualizedList from "react-virtualized/dist/commonjs/List";

import styles from "@/src/components/compositions/List.module.scss";

const cls = cva(styles.List, {
  variants: {},
  defaultVariants: {
    makeSpaceForFilters: false,
  },
});

export interface Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cls> {
  items?: InstanceItem[];
  mainComps?: any[];
  loading: boolean;
}

const ROW_HEIGHT = 28;

const List = ({ items, mainComps, loading, ...props }: Props) => {
  const [selection, setSelection] = useState<string[]>();

  // Figma: Receive
  useEffect(() => {
    const handle = ({ data: { pluginMessage: msg } }: MessageEvent) => {
      if (msg.content == "run" || msg.content == "selectionchange") {
        setSelection(msg.data.selection);
      }
    };

    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [setSelection]);

  const [sortedItems, setSortedItems] = useState<InstanceItem[]>();

  useEffect(() => {
    if (items) setSortedItems(items.sort(getComparator("asc", "name")));
  }, [items, setSortedItems, getComparator]);

  const rowRenderer = ({ key, index, style }: any) => {
    const item = sortedItems && sortedItems[index];

    const mainCompInfo = mainComps?.find((c) => {
      return c.sourceInstances.findIndex((i: any) => i.id == item?.id) >= 0;
    });

    return (
      item && (
        <ListItem
          key={key}
          item={item}
          style={style}
          selected={selection?.includes(item.id)}
          mainCompInfo={{
            info: mainCompInfo,
          }}
        />
      )
    );
  };

  const emptyListRows = 24;
  const emptyListRowRender = ({ key, index, style }: any) => {
    return (
      <ListItemLoading
        key={key}
        style={style}
        order={{ index: index, total: emptyListRows }}
      />
    );
  };

  const empty = sortedItems && sortedItems.length == 0;

  return (
    <div className={cls()} {...props}>
      {loading && (!sortedItems || sortedItems.length <= 0) ? (
        <AutoSizer>
          {({ height, width }) => {
            return (
              <VirtualizedList
                className={styles.VirtualizedList}
                height={height}
                rowCount={emptyListRows}
                rowHeight={ROW_HEIGHT}
                rowRenderer={emptyListRowRender}
                width={width}
              />
            );
          }}
        </AutoSizer>
      ) : empty ? (
        <ListItemEmpty />
      ) : (
        sortedItems && (
          <AutoSizer>
            {({ height, width }) => {
              return (
                <VirtualizedList
                  className={styles.VirtualizedList}
                  height={height}
                  rowCount={sortedItems.length}
                  rowHeight={ROW_HEIGHT}
                  rowRenderer={rowRenderer}
                  width={width}
                  selection={selection}
                />
              );
            }}
          </AutoSizer>
        )
      )}
    </div>
  );
};

export default List;
