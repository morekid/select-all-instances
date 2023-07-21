figma.showUI(__html__, {
  width: 480,
  height: 776,
  themeColors: true,
});

type item = {
  id: string; // The id.
  name: string; // The name.
  visible: boolean; // Whether it is hidden.
  nested: string | boolean; // Whether the instance is nested in another instance and the parent instance name.
  mainComp?: {
    id: string;
    name: string; // The name.
    remote: boolean; // Whether it lives in an external library.
    parent: {
      id?: string; // The parent id.
      name?: string; // The parent name.
    };
    publishStatus?: string; // The publishing status.
    missing?: boolean; // Whether it's missing at origin.
    private?: boolean; // Whether it's private (starts with underscore).
  } | null;
};

type MsgOutbound = {
  type:
    | "returned-list"
    | "async-maincomp-missing-attr"
    | "async-maincomp-published-attr";
  data: ListingData;
};

type ListingData = {
  items: SceneNode[]; // The filtered instance nodes.
  total?: number; // The total count of instance nodes.
};

type MsgInbound = {
  type: "list" | "select";
  query: ListingQuery;
};

type ListingQuery = {
  mode: "all" | "term" | "term-exact" | "one" | "listed";
  term?: string; // A search term. Used for modes: "term" and "term-exact".
  id?: string; // A figma node id. Used for modes: "one".
  ids?: string[]; // An array of figma node ids. Used for modes: "listed".
  scopeToSelection: boolean; // Filter from current selection instead of all page nodes.
  hideNested: boolean; // Only include page nodes that are not nested within other instances.
  showLocal: boolean; // Show instances whose main compomnent is local.
  showRemote: boolean; // Show instances whose main compomnent is remote.
};

figma.ui.onmessage = (msg) => {
  console.clear();

  const checkIfNested = (n: BaseNode): string | boolean => {
    if (n.parent) {
      if (n.parent.constructor.name == "InstanceNode") return n.parent.name;
      else return checkIfNested(n.parent);
    }
    return false;
  };

  const checkIfLocal = (n: BaseNode) => {
    if ((n as InstanceNode).mainComponent?.remote) return false;
    return true;
  };

  const checkIfRemote = (n: BaseNode) => {
    if ((n as InstanceNode).mainComponent?.remote) return true;
    return false;
  };

  const getItemAttrs = (n: SceneNode) => {
    const item: item = {
      id: n.id,
      name: n.name,
      visible: n.visible,
      nested: checkIfNested(n),
    };

    const mainComp = (n as InstanceNode).mainComponent;
    if (mainComp) {
      item.mainComp = {
        id: mainComp.id,
        name: mainComp.name,
        remote: mainComp.remote,
        publishStatus: undefined,
        missing: undefined,
        private: mainComp.name.indexOf("_") == 0,
        parent: {
          id: mainComp.parent?.id,
          name: mainComp.parent?.name,
        },
      };

      // Check publish status
      // Unused: always returns "UNPUBLSIHED"
      // figma.ui.postMessage({ type: "maincomp-published-check-start" });
      // mainComp.getPublishStatusAsync().then((resp) => {
      //   if (item.mainComp) {
      //     item.mainComp.publishStatus = resp;
      //   }
      //   figma.ui.postMessage({
      //     type: "async-maincomp-published-attr",
      //     data: { items: [item] },
      //   });
      //   figma.ui.postMessage({ type: "maincomp-published-check-end" });
      // });

      // Check missing
      if (!mainComp.parent?.id) {
        figma.ui.postMessage({ type: "maincomp-missing-check-start" });

        figma
          .importComponentByKeyAsync(mainComp.key)
          .then((resp) => {
            if (item.mainComp) {
              item.mainComp.missing = false;
              figma.ui.postMessage({
                type: "async-maincomp-missing-attr",
                data: { items: [item] },
              });
            }
            figma.ui.postMessage({ type: "maincomp-missing-check-end" });
          })
          .catch((err) => {
            if (item.mainComp) {
              item.mainComp.missing = true;
              figma.ui.postMessage({
                type: "async-maincomp-missing-attr",
                data: { items: [item] },
              });
            }
            figma.ui.postMessage({ type: "maincomp-missing-check-end" });
          });
      } else {
        item.mainComp.missing = false;
        figma.ui.postMessage({
          type: "async-maincomp-missing-attr",
          data: { items: [item] },
        });
      }
    }

    return item;
  };

  const getFilteredItemsList = (
    msg: MsgInbound,
    items: readonly SceneNode[]
  ): {
    count: number;
    filtered: SceneNode[];
  } => {
    const out: { count: number; filtered: SceneNode[] } = {
      count: 0,
      filtered: [],
    };

    if (!items) return out;

    for (const n of items) {
      const isNested = checkIfNested(n);
      const isLocal = checkIfLocal(n);
      const isRemote = checkIfRemote(n);

      if (msg.query.hideNested && isNested) continue;

      if (
        (isLocal && msg.query.showLocal) ||
        (isRemote && msg.query.showRemote)
      ) {
        if (n.constructor.name == "InstanceNode") {
          if (
            msg.query.mode == "all" ||
            (msg.query.mode == "term" &&
              msg.query?.term &&
              n.name.toLowerCase().indexOf(msg.query?.term.toLowerCase()) >=
                0) ||
            (msg.query.mode == "term-exact" && n.name == msg.query.term)
          ) {
            out.count++;
            out.filtered.push(n);
          }
        }
      }

      // Recursive
      const children = (n as any).children;

      if (!children) continue;

      const childrenFiltered = getFilteredItemsList(msg, children);
      out.filtered = [...out.filtered, ...childrenFiltered.filtered];
      out.count += childrenFiltered.count;
    }

    return out;
  };

  const getItemsWithIds = (
    ids: string[],
    items: readonly SceneNode[]
  ): {
    count: number;
    filtered: SceneNode[];
  } => {
    const out: { count: number; filtered: SceneNode[] } = {
      count: 0,
      filtered: [],
    };

    if (!items || ids.length <= 0) return out;

    for (const n of items) {
      if (msg.query.ids.includes(n.id)) out.filtered.push(n);

      // Recursive
      const children = (n as any).children;

      if (!children) continue;

      const childrenFiltered = getItemsWithIds(ids, children);
      out.filtered = [...out.filtered, ...childrenFiltered.filtered];
      out.count += childrenFiltered.count;
    }

    return out;
  };

  // List -----------------------------------------------------------------------
  if (msg.type == "list") {
    // Reset main component checks counter
    figma.ui.postMessage({ type: "maincomp-missing-check-reset" });

    // Get filtered items
    let count = 0;
    let filtered: SceneNode[] = [];

    if (!msg.query.scopeToSelection) {
      ({ filtered, count } = getFilteredItemsList(
        msg,
        figma.currentPage.children
      ));
    } else {
      ({ filtered, count } = getFilteredItemsList(
        msg,
        figma.currentPage.selection
      ));
    }

    // Get useful attributes for each instance
    const items: item[] = [];
    for (const n of filtered) {
      items.push(getItemAttrs(n));
    }

    // Sort
    items.sort((a, b) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      else return -1;
    });

    figma.ui.postMessage({
      type: "returned-list",
      data: { items: items, total: count },
    });
  }

  // Select -----------------------------------------------------------------------
  if (msg.type == "select") {
    let selection: SceneNode[] = [];
    let page: PageNode = figma.currentPage;

    if (msg.query.mode == "one") {
      for (const p of figma.root.children) {
        const node = p.findOne((n) => n.id === msg.query.id);
        if (node) {
          page = p;
          selection.push(node);
          break;
        }
      }
    } else if (msg.query.mode == "listed") {
      selection = getItemsWithIds(
        msg.query.ids,
        figma.currentPage.children
      ).filtered;
    }

    if (selection?.length > 0) {
      if (page) {
        figma.currentPage = page;
        page.selection = selection;
      }
      figma.viewport.scrollAndZoomIntoView(selection);
    }
  }
};

figma.on("run", () => {
  figma.ui.postMessage({
    type: "start",
    selectedCount: figma.currentPage.selection.length,
  });
});

figma.on("selectionchange", () => {
  figma.ui.postMessage({
    type: "selection-change",
    total: figma.currentPage.selection.length,
  });
});

figma.on("currentpagechange", () => {
  figma.ui.postMessage({
    type: "page-change",
  });
});

figma.on("documentchange", () => {
  figma.ui.postMessage({
    type: "document-change",
  });
});
