import { Lister } from "@/src/api/list";
import {
  nonBlockingSelectAll,
  selectOne,
  selectOneInAnyPage,
} from "@/src/api/select";
import { UI } from "@/src/api/ui";
import { isInstance } from "@/src/utils/utils";
import { MsgToFigma } from "@/typings-custom/app";

const ui = new UI();

figma.showUI(__html__, {
  width: ui.getSize().width,
  height: ui.getSize().height,
  themeColors: true,
});

// Required to use "documentchange" event.
// Reduces performance considerably.
figma.loadAllPagesAsync();

// The lister object.
// Object required to stop async processing where necessary.
const lister = new Lister();

// Utility to list
const onList = () => {
  figma.ui.postMessage({
    content: "refresh",
  });

  lister.get().then((response) => {
    setTimeout(() => {
      figma.ui.postMessage({
        content: "list",
        data: response,
      });
    }, 10);
  });
};

// Utility to relist
const onRelist = () => {
  /** Clear console on start */
  console.clear();
  lister.stop();

  // Wait for the page udate
  setTimeout(onList, 10);
};

/**
 * Figma events
 */
figma.on("run", () => {
  /** Clear console on start */
  console.clear();

  /** Starting message for the UI. */
  figma.ui.postMessage({
    content: "run",
    data: {
      count: figma.currentPage.selection.length,
      selection: figma.currentPage.selection.map((n) => n.id),
      ui: {
        size: ui.getSize(),
        sizeFilters: ui.getSizeFilters(),
      },
    },
  });
});

figma.on("selectionchange", () => {
  figma.ui.postMessage({
    content: "selectionchange",
    data: {
      count: figma.currentPage.selection.length,
      selection: figma.currentPage.selection.map((n) => n.id),
    },
  });
});

figma.on("currentpagechange", onRelist);

figma.on("documentchange", (e) => {
  const message = () =>
    figma.ui.postMessage({
      content: "instancesChanged",
    });

  for (const change of e.documentChanges) {
    switch (change.type) {
      case "CREATE":
        if (isInstance(change.node)) message();
        break;

      case "DELETE":
        if (isInstance(change.node)) message();
        break;

      case "PROPERTY_CHANGE":
        if (isInstance(change.node)) {
          if (
            change.properties.includes("variant" as NodeChangeProperty) ||
            change.properties.includes("parent") ||
            change.properties.includes("name") ||
            change.properties.includes("visible")
          ) {
            message();
          }
        }
        break;
    }
  }
});

/**
 * UI events
 * */
figma.ui.onmessage = (msg: MsgToFigma) => {
  /**
   * This runs at the beginning, should try
   * and always work with state after to avoid rebuilding this list.
   */
  if (msg.action == "list") {
    onList();
  }

  /**
   * Select a node from the list item clicked in the UI
   */
  if (msg.action == "selectNode") {
    selectOne(msg.data.id);
  }

  /**
   * Select a node from any page
   */
  if (msg.action == "selectNodeInAnyPage") {
    selectOneInAnyPage(msg.data.id);
  }

  /**
   * Select all nodes from the list item clicked in the UI
   */
  if (msg.action == "selectAllNodes") {
    nonBlockingSelectAll(msg.data.ids).then((result) => {
      if (result.done !== undefined) {
        figma.ui.postMessage({
          content: "selectionDone",
        });
      }
    });
  }

  /**
   * Resize the ui
   */
  if (msg.action == "resize") {
    ui.resize(msg.data);

    figma.ui.postMessage({
      content: "resized",
      data: {
        ui: {
          size: ui.getSize(),
          sizeFilters: ui.getSizeFilters(),
        },
      },
    });
  }

  /**
   * Get one main comp
   */
  if (msg.action == "getMainComp") {
    lister.getOneMainComp({ instanceId: msg.data.id });
  }
};
