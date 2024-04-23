import {
  NodeWithChildren,
  debounce,
  isInstance,
  nodeWithChildren,
  sleep,
} from "@/src/utils/utils";
import { InstanceItem, MainCompInfo, Parent } from "@/typings-custom/app";
import { TaskRunner } from "./queue";

let taskRunner: TaskRunner;

export class Lister {
  listing: boolean = false;

  constructor() {}

  get = async () => {
    this.listing = true;
    figma.ui.postMessage({ content: "loading", data: { loading: true } });

    // Reset task runner
    taskRunner = new TaskRunner();

    const data = await this.getInstances(figma.currentPage.children);

    figma.ui.postMessage({ content: "loading", data: { loading: false } });
    this.listing = false;

    return data;
  };

  stop = () => (this.listing = false);

  updateTotalCount = (count: number) => {
    figma.ui.postMessage({
      content: "updateTotalListCount",
      data: { count },
    });
  };

  updateListPartial = (items: InstanceItem[]) => {
    figma.ui.postMessage({
      content: "updateListPartial",
      data: { items },
    });
  };

  getMainCompInfo = async (
    node: InstanceNode,
  ): Promise<MainCompInfo | null> => {
    const mainComp = await node.getMainComponentAsync();

    if (mainComp) {
      const info: MainCompInfo = {
        id: mainComp.id,
        name: mainComp.name,
        remote: mainComp.remote,
        publishStatus: "n/a",
        // Calculating missing as follows only works for local components
        // otherwise we always return false
        missing: !mainComp.remote ? !mainComp.parent : false,
        private: mainComp.name.indexOf("_") == 0,
        // Defaults to always true for local comps
        updated: !mainComp.remote ? true : false,
        parent: mainComp.parent
          ? {
              id: mainComp.parent.id,
              name: mainComp.parent.name,
              componentSet: mainComp.parent.type == "COMPONENT_SET",
            }
          : undefined,
        sourceInstances: [
          {
            id: node.id,
            name: node.name,
          },
        ],
        imported: null,
      };

      if (mainComp.remote) {
        return await figma
          .importComponentByKeyAsync(mainComp.key)
          .then((imported) => {
            return {
              ...info,
              imported: {
                id: imported.id,
                name: imported.name,
                remote: imported.remote,
                publishStatus: "n/a",
                missing: false,
                private: imported.parent
                  ? imported.parent.name.indexOf("_") == 0
                  : imported.name.indexOf("_") == 0,
                updated: imported.id == mainComp.id,
                parent: imported.parent
                  ? {
                      id: imported.parent.id,
                      name: imported.parent.name,
                      componentSet: imported.parent.type == "COMPONENT_SET",
                    }
                  : undefined,
                sourceInstances: [
                  {
                    id: node.id,
                    name: node.name,
                  },
                ],
              },
            };
          })
          .catch((err) => {
            return {
              ...info,
              missing: true,
              imported: null,
            };
          });
      } else {
        return info;
      }
    } else {
      return null;
    }
  };

  /**
   * Figma node tree traversal
   * Offers throttled UI blocking for UX boost.
   * Adapted from: https://forum.figma.com/t/figma-layers-tree-traversal-estimating-size/551/4
   */
  getInstances = async (
    nodes: readonly SceneNode[],
    throttle: { count: number; duration: number } = { count: 500, duration: 0 },
  ): Promise<{
    count: number;
    items: InstanceItem[];
  } | null> => {
    let count = 0;
    let items: InstanceItem[] = [];
    let partial: InstanceItem[] = [];

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
      ({ items, partial } = this.processRes(res, items, partial));

      count++;

      if (count % 100 == 0) {
        // send and flush partial
        this.updateListPartial(partial);
        partial = [];
      }

      if (!this.listing) break;
    }

    // DEBUG: Performance test
    // console.log("ms/nodes", Date.now() - start, count);

    if (!this.listing) {
      return null;
    } else
      return {
        count: items.length,
        items,
      };
  };

  /**
   * Process the resource for each traversing iteration of getInstances.
   */
  processRes = (res: any, items: InstanceItem[], partial: InstanceItem[]) => {
    if (res.value) {
      const processed = this.processNode(res.value);
      if (processed) {
        items.push(processed);
        partial.push(processed);
      }
    }

    debounce(() => this.updateTotalCount(items.length), 100)();

    return { items, partial };
  };

  /**
   * Return instance item with custom attrs if node is instance.
   */
  processNode = (node: SceneNode) => {
    if (isInstance(node)) return this.nodeToInstanceItem(node as InstanceNode);
    else return false;
  };

  /**
   * Get custom attrs from instance node.
   */
  nodeToInstanceItem = (node: InstanceNode) => {
    const res = this.getParents(node.parent);

    const item: InstanceItem = {
      id: node.id,
      name: node.name,
      visible: node.visible,
      parents: res.parents,
      parentInstances: res.parentInstances,
    };

    // Defer to avoid:
    // "MemPool/Node: cannot dereference nullptr" in countError (FGMemPool.cpp)
    // Uncaught TypeError: Cannot read properties of null (reading 'id')
    setTimeout(() => {
      taskRunner.add((cb: number) => {
        return new Promise((resolve, reject) => {
          this.getMainCompInfo(node).then((response: any) => {
            figma.ui.postMessage({
              content: "mainCompRunner",
              data: {
                todo: taskRunner.todo,
                done: taskRunner.done,
              },
            });

            if (response) {
              figma.ui.postMessage({
                content: "mainCompInfo",
                data: {
                  mainCompInfo: response,
                },
              });
            }

            resolve(cb);
          });
        });
      });
    }, 1);

    return item;
  };

  /**
   * Get ancestors structure
   */

  getParents = (
    node: BaseNode | null,
    throttle: { count: number; duration: number } = {
      count: 10000,
      duration: 0,
    },
  ): {
    parents: Parent[] | null;
    parentInstances: Parent[] | null;
  } => {
    let count = 0;
    let parents: Parent[] = [];
    let parentInstances: Parent[] = [];

    // DEBUG: Performance test
    // let start = Date.now();

    function* getRecursive(node: BaseNode | null): Generator<BaseNode> {
      if (node) {
        yield node;
        yield* getRecursive(node.parent);
      }
    }

    var it = getRecursive(node);
    let res;
    while (!res || !res.done) {
      res = it.next();

      if (res.value) {
        parents.unshift({
          id: res.value.id,
          name: res.value.name,
          visible: res.value.visible,
        });
        isInstance(res.value) &&
          parentInstances.unshift({
            id: res.value.id,
            name: res.value.name,
            visible: res.value.visible,
          });
      }

      count++;
    }

    // DEBUG: Performance test
    // console.log(Date.now() - start, count);

    return {
      parents: parents.length > 0 ? parents : null,
      parentInstances: parentInstances.length > 0 ? parentInstances : null,
    };
  };

  getOneMainComp = (opts: { instanceId: string }) => {
    const node = figma.currentPage.findOne((n) => n.id === opts.instanceId);

    if (!isInstance(node as BaseNode)) return;

    setTimeout(() => {
      this.getMainCompInfo(node as InstanceNode).then((response: any) => {
        if (response) {
          figma.ui.postMessage({
            content: "mainCompInfo",
            data: {
              mainCompInfo: response,
            },
          });
        }
      });
    }, 1);
  };
}
