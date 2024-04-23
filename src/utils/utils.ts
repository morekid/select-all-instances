/** All node types without children */
export type NodeWithoutChildren =
  | SliceNode
  | VectorNode
  | StarNode
  | LineNode
  | EllipseNode
  | PolygonNode
  | RectangleNode
  | TextNode
  | StickyNode
  | ConnectorNode
  | ShapeWithTextNode
  | CodeBlockNode
  | StampNode
  | WidgetNode
  | EmbedNode
  | LinkUnfurlNode
  | MediaNode
  | HighlightNode
  | WashiTapeNode
  | TableNode;

/** All SceneNode types with children */
export type NodeWithChildren = Exclude<SceneNode, NodeWithoutChildren>;

/** Check if node can have children */
export const nodeWithChildren = (node: SceneNode) => {
  return !(
    node.type == "VECTOR" ||
    node.type == "STAR" ||
    node.type == "LINE" ||
    node.type == "ELLIPSE" ||
    node.type == "POLYGON" ||
    node.type == "RECTANGLE" ||
    node.type == "TEXT" ||
    node.type == "STICKY" ||
    node.type == "CONNECTOR" ||
    node.type == "SHAPE_WITH_TEXT" ||
    node.type == "CODE_BLOCK" ||
    node.type == "STAMP" ||
    node.type == "WIDGET" ||
    node.type == "EMBED" ||
    node.type == "LINK_UNFURL" ||
    node.type == "MEDIA" ||
    node.type == "HIGHLIGHT" ||
    node.type == "WASHI_TAPE" ||
    node.type == "TABLE"
  );
};

/** Check if node is of type InstanceNode */
export const isInstance = (node: any) => {
  return node.type == "INSTANCE";
};

/** Sleep code execution */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Debouncing */
export const debounce = (func: Function, timeout = 300) => {
  let timer: number;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

/** Sorting utils */
export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export type Order = "asc" | "desc";

export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function getStringComparator(
  order: Order,
): (a: string, b: string) => number {
  return order === "desc"
    ? (a, b) => (a > b ? -1 : a < b ? 1 : 0)
    : (a, b) => (a > b ? 1 : a < b ? -1 : 0);
}
/** END: Sorting utils */

/**
 * Return an x,y seeded random number between 0 and 1
 * @param x - The x seed.
 * @param y - The y seed.
 */
export const randSeededNum = (x: number, y: number) => {
  // constants
  const c1 = 123.34;
  const c2 = 456.21;
  const c3 = 45.32;
  // mult by two random constants
  let nX = x * c1;
  let nY = y * c2;
  // get fractional part
  nX = nX % 1;
  nY = nY % 1;
  // dot with itself added by a seed
  nX += nX * (nX + c3) + nY * (nY + c3);
  nY += nX * (nX + c3) + nY * (nY + c3);
  // return fractional part of product
  return (nX * nY) % 1;
};

/**
 * Evaluation
 * --------------------------------------------------------------------------------------------------------------
 */

/**
 * Evaluates a string against a search term.
 * @param term - The search term.
 * @param str - The string to match.
 * @param opts - Mathcing options.
 * @param opts.exact - Will exact match with "term or "term".
 */
export const richSearchTermMatch = (term: string, str: string) => {
  const matchCase =
    term.match(/^"/g) !== null ||
    (term.match(/^"/g) !== null && term.match(/"$/g) !== null);

  if (matchCase) {
    term = term.replaceAll('"', "");
  } else {
    term = term.toLowerCase();
    str = str.toLowerCase();
  }
  return str.includes(term);
};

/**
 * Returns search term for display.
 * Removes search options like the case match quotes: " or "".
 * @param term - The search term.
 */
export const niceSearchTerm = (term: string) => {
  const matchCase =
    term.match(/^"/g) !== null ||
    (term.match(/^"/g) !== null && term.match(/"$/g) !== null);

  if (matchCase) {
    return term.replaceAll('"', "");
  } else {
    return term.toLowerCase();
  }
};
