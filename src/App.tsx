import {
  Filters,
  Options as FiltersOptions,
  defaultFilters,
} from "@/src/components/compositions/Filters";
import Heading from "@/src/components/compositions/Heading";
import List from "@/src/components/compositions/List";
import ResizeHandler from "@/src/components/elements/ResizeHandler";
import { richSearchTermMatch } from "@/src/utils/utils";
import { InstanceItem, MainCompInfo, MsgToFigma } from "@/typings-custom/app";
import { cva } from "class-variance-authority";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import "@/src/main.scss";
import "@/src/vars.module.scss";

import styles from "@/src/App.module.scss";

// TODO: check light mode
// TODO: Replace title attrs with proper tooltips
// TODO: Toggle automatic refresh

const cls = cva(["App", styles.App]);

export default function App() {
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [sizeFilters, setSizeFilters] = useState<number>();
  const [showFilters, setShowFilters] = useState(false);
  const [clearFilters, setClearFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const [filters, setFilters] = useState<FiltersOptions>(defaultFilters);
  const [instances, setInstances] = useState<InstanceItem[]>();
  const [filteredInstances, setFilteredInstances] = useState<InstanceItem[]>();
  const [figmaSelected, setFigmaSelected] = useState<string[]>();
  const [figmaMainComps, setFigmaMainComps] = useState<MainCompInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Figma: Post
  useEffect(getList, []);

  // Figma: Receive
  useEffect(() => {
    const handle = ({ data: { pluginMessage: msg } }: MessageEvent) => {
      if (msg.content == "run") {
        if (msg.data.ui?.size) {
          setSize(msg.data.ui.size);
          setSizeFilters(msg.data.ui.sizeFilters);
        }
      }

      if (msg.content == "resized") {
        if (msg.data.ui?.size) {
          setSize(msg.data.ui.size);
          setSizeFilters(msg.data.ui.sizeFilters);
        }
      }

      if (msg.content == "refresh") {
        setLoading(true);
        setInstances(undefined);
        setFilteredInstances(undefined);
        setFigmaSelected(undefined);
        setFigmaMainComps([]);
      }

      if (msg.content == "list") {
        setInstances(msg.data.items);
        setLoading(false);
      }

      if (msg.content == "updateListPartial") {
        setInstances((prevInstances) => [
          ...(prevInstances || []),
          ...msg.data.items,
        ]);
      }

      if (msg.content == "selectionchange") {
        setFigmaSelected(msg.data.selection);
      }

      if (msg.content == "mainCompInfo") {
        setFigmaMainComps((previous: MainCompInfo[]) => {
          let comps = getUpdatedFigmaMainComps(msg.data.mainCompInfo, previous);
          return comps;
        });
      }
    };

    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [figmaMainComps, getUpdatedFigmaMainComps]);

  useEffect(() => {
    const root = document.querySelector(":root");

    if (root) {
      if (size?.width && size?.height) {
        (root as HTMLElement).style.setProperty(
          "--pluginWidth",
          size.width + "px",
        );
        (root as HTMLElement).style.setProperty(
          "--pluginHeight",
          size.height + "px",
        );
      }
      if (sizeFilters) {
        (root as HTMLElement).style.setProperty(
          "--pluginFiltersSidebar",
          sizeFilters + "px",
        );
      }
    }
  }, [size, sizeFilters]);

  /**
   * Set filters
   */
  const handleFiltering = useCallback((newFilters: FiltersOptions) => {
    const active = Object.values(newFilters).find((value) => value == true);
    // Set filtering status
    setIsFiltering(active || active != undefined);

    setFilters(newFilters);
  }, []);

  useEffect(() => {
    if (instances)
      setFilteredInstances(
        filtered(instances, filters, searchTerm, figmaSelected, figmaMainComps),
      );
  }, [filters, searchTerm, instances, figmaSelected, figmaMainComps]);

  /**
   * Select all
   */
  const handleSelectAll = useCallback(() => {
    const nodeIds = filteredInstances
      ?.filter((i: InstanceItem) => {
        // Add to selection if doesn't have parent
        if (!i.parents) {
          return true;
          // Or if the parent won't be selected
        } else {
          const tbSelectedParent = filteredInstances.find(
            (ii: InstanceItem) => {
              return i.parents?.find((p) => p.id == ii.id);
            },
          );
          return !tbSelectedParent;
        }
      })
      .map((n) => n.id);
    selectAll(nodeIds);
  }, [filteredInstances]);

  return (
    <ResizeHandler>
      <div className={cls()}>
        <Heading
          onToggleFilters={setShowFilters}
          onClearFilters={setClearFilters}
          isFiltering={isFiltering}
          onRefresh={getList}
          onSearch={setSearchTerm}
          onSelectAll={handleSelectAll}
          filteredInstancesCount={filteredInstances?.length}
        />
        <List
          items={filteredInstances}
          mainComps={figmaMainComps}
          loading={loading}
        />
      </div>
      <Filters
        classes={[styles.SidebarFilters]}
        onFiltering={handleFiltering}
        visible={showFilters}
        clearFilters={clearFilters}
      />
    </ResizeHandler>
  );
}

const filtered = (
  items: InstanceItem[],
  filters: FiltersOptions,
  searchTerm?: string,
  figmaSelected: string[] = [],
  figmaMainComps: MainCompInfo[] = [],
): InstanceItem[] => {
  const filtered = items.filter((item) => {
    let isIn = true;

    if (searchTerm) {
      if (isIn && !testTerm(item, searchTerm)) isIn = false;
    }

    if (filters.unnestedOnly) {
      if (isIn && item.parentInstances) isIn = false;
    }

    if (filters.inSelection) {
      if (isIn && !testSelected(item, figmaSelected)) isIn = false;
    }

    if (filters.localMainComp) {
      if (isIn && testRemoteMainComp(item, figmaMainComps)) isIn = false;
    }

    if (filters.remoteMainComp) {
      if (isIn && !testRemoteMainComp(item, figmaMainComps)) isIn = false;
    }

    if (filters.missingMainComp) {
      if (isIn && !testMissingMainComp(item, figmaMainComps)) isIn = false;
    }

    if (filters.existingMainComp) {
      if (isIn && testMissingMainComp(item, figmaMainComps)) isIn = false;
    }

    if (filters.visibleInstances) {
      if (isIn && !testVisible(item)) isIn = false;
    }

    if (filters.hiddenInstances) {
      if (isIn && testVisible(item)) isIn = false;
    }

    if (filters.updatedInstances) {
      if (isIn && testUpdateAvailable(item, figmaMainComps)) isIn = false;
    }

    if (filters.outdatedInstances) {
      if (isIn && !testUpdateAvailable(item, figmaMainComps)) isIn = false;
    }

    return isIn;
  });
  return filtered;
};

const getUpdatedFigmaMainComps = (
  newComp: MainCompInfo,
  figmaMainComps: MainCompInfo[],
) => {
  /**
   * Add or replace item to a collection.
   *
   * The item is replaced if one is found by checking prm equality.
   * Before replacing, the item can be processed based on previous item
   * with a custom callback.
   *
   * @param item
   * @param collection
   * @param prm
   * @param processPrevious
   * @returns the updated collection
   */
  const addOrReplace = <T,>(
    item: T,
    collection: T[],
    prm: keyof T,
    processPrevious?: (item: T, previous: T) => T,
  ) => {
    const newCollection = [...collection];
    const idx = newCollection.findIndex((cItem) => cItem[prm] === item[prm]);
    if (idx >= 0) {
      processPrevious && processPrevious(item, newCollection[idx]);
      newCollection[idx] = item;
    } else {
      newCollection.push(item);
    }
    return newCollection;
  };

  // Add or replace new main comp info
  let comps = addOrReplace(
    newComp,
    figmaMainComps,
    "id",
    (item: any, previous: any) => {
      // We update the main comp source instances
      // to also contain the new source instance
      item.sourceInstances = addOrReplace(
        item.sourceInstances[0],
        previous.sourceInstances,
        "id",
      );
      return item;
    },
  );

  return comps;
};

const getMainComp = (item: InstanceItem, figmaMainComps: MainCompInfo[]) => {
  return figmaMainComps.find((mainComp) => {
    const instance = mainComp.sourceInstances.find(
      (instance) => instance.id == item.id,
    );
    if (instance) return true;
    else return false;
  });
};

const testMissingMainComp = (
  item: InstanceItem,
  figmaMainComps: MainCompInfo[],
) => {
  const mainComp = getMainComp(item, figmaMainComps);
  if (!mainComp || mainComp?.missing) return true;
  else return false;
};

const testRemoteMainComp = (
  item: InstanceItem,
  figmaMainComps: MainCompInfo[],
) => {
  const mainComp = getMainComp(item, figmaMainComps);
  if (!mainComp || mainComp?.remote) return true;
  else return false;
};

const testUpdateAvailable = (
  item: InstanceItem,
  figmaMainComps: MainCompInfo[],
) => {
  const mainComp = getMainComp(item, figmaMainComps);
  if (mainComp && mainComp.imported && !mainComp.imported.updated) return true;
  else return false;
};

const testSelected = (item: InstanceItem, selection: string[]) => {
  return selection.find((id) => {
    // item is in selection or ancestors are
    return item.id == id || item.parents?.find((p) => p.id == id) != undefined;
  });
};

const testTerm = (item: InstanceItem, term: string) => {
  let isIn = false;
  // Add strings to this array for more tests
  const searchStrs = [item.name];
  searchStrs.forEach((str) => {
    if (richSearchTermMatch(term, str)) isIn = true;
  });
  return isIn;
};

const testVisible = (item: InstanceItem) => {
  const hiddenParents = item.parents?.some((parent) => parent.visible == false);
  return !hiddenParents && item.visible;
};

const getList = () => {
  parent.postMessage({ pluginMessage: { action: "list" } as MsgToFigma }, "*");
};

const selectAll = (nodeIds?: string[]) => {
  if (nodeIds) {
    parent.postMessage(
      {
        pluginMessage: {
          action: "selectAllNodes",
          data: { ids: nodeIds },
        } as MsgToFigma,
      },
      "*",
    );
  }
};
