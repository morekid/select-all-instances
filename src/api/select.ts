import { NodeWithChildren, nodeWithChildren, sleep } from "@/src/utils/utils";

export const selectOne = async (id: string) => {
  let selection: SceneNode[] = [];
  let page: PageNode = figma.currentPage;

  const node = page.findOne((n) => n.id === id);
  if (node) {
    selection.push(node);
  }

  if (selection?.length > 0) {
    page.selection = selection;
    figma.viewport.scrollAndZoomIntoView(selection);
  }
};

export const selectOneInAnyPage = async (id: string) => {
  let selection: SceneNode[] = [];
  let page: PageNode = figma.currentPage;
  await figma.loadAllPagesAsync();

  for (const p of figma.root.children) {
    const node = p.findOne((n) => n.id === id);
    if (node) {
      page = p;
      selection.push(node);
      break;
    }
  }

  if (selection?.length > 0) {
    if (page) {
      figma.setCurrentPageAsync(page).then(() => {
        page.selection = selection;
        figma.viewport.scrollAndZoomIntoView(selection);
      });
    }
  }
};

export const selectAll = async (ids: string[]) => {
  let page: PageNode = figma.currentPage;

  const selection = page.findAll((n) => ids.includes(n.id));

  if (selection?.length > 0) {
    page.selection = selection;
    figma.viewport.scrollAndZoomIntoView(selection);
  }
};

export const nonBlockingSelectAll = async (
  ids: string[],
  throttle: { count: number; duration: number } = { count: 500, duration: 0 },
): Promise<{ done: boolean }> => {
  const nodes = figma.currentPage.children;
  let selection: SceneNode[] = [];

  let count = 0;

  // DEBUG: Performance test
  // let start = Date.now();

  function* getRecursive(
    nodes: readonly SceneNode[],
  ): Generator<SceneNode | SceneNode[]> {
    const len = nodes.length;
    if (len === 0) {
      return;
    }

    for (var i = 0; i < len; i++) {
      var node = nodes[i];

      yield node;

      if (nodeWithChildren(node)) {
        const children = (node as NodeWithChildren).children;
        if (children) {
          yield* getRecursive(children);
        }
      }
    }
  }

  var it = getRecursive(nodes);
  let res;
  while (!res || !res.done) {
    // TODO(nice-to-have): check better optimization
    // https://web.dev/articles/optimize-long-tasks
    // https://evilmartians.com/chronicles/figma-plugin-api-dive-into-advanced-algorithms-and-data-structures
    if (count % throttle.count == 0) await sleep(throttle.duration);

    res = it.next();
    ({ selection } = nonBlockingSelectAllProcessRes(res, selection, ids));

    count++;
  }

  // DEBUG: Performance test
  // console.log("ms/nodes", Date.now() - start, count);

  if (selection?.length > 0) {
    figma.currentPage.selection = selection;
    figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);

    return { done: true };
  }

  return { done: false };
};

/**
 * Process the resource for each traversing iteration of nonBlockingSelectAll.
 */
const nonBlockingSelectAllProcessRes = (
  res: any,
  selection: SceneNode[],
  ids: string[],
) => {
  if (res.value) {
    const isIn = ids.includes(res.value.id);

    if (isIn) {
      selection.push(res.value);
    }
  }

  return { selection };
};
