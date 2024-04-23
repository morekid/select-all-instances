export type Parent = { name: string; id: string; visible?: boolean };

export type ComponentParent = Parent & { componentSet: boolean };

export type InstanceItem = {
  id: string; // The id.
  name: string; // The name.
  visible: boolean; // Whether it is hidden.
  parentInstances: Parent[] | null; // The node's parent instances
  parents: Parent[] | null; // The node's parents
  mainComp?: {
    id: string;
    name: string; // The name.
    remote: boolean; // Whether it lives in an external library.
    parent: ComponentParent;
    publishStatus?: string; // The publishing status.
    missing?: boolean; // Whether it's missing at origin.
    private?: boolean; // Whether it's private (starts with underscore).
  } | null;
};

export type MainCompInfoBase = {
  // The main comp id.
  // For remote comps getMainComponentAsync() can return
  // a different one than importComponentByKeyAsync()
  // when local instance is out of date
  id: string;

  // The comp name
  name: string;

  // Whether the comp is in a remote library
  remote: boolean;

  // https://www.figma.com/plugin-docs/api/PublishStatus/
  // https://www.figma.com/plugin-docs/api/ComponentNode/#getpublishstatusasync
  // !!! Only knows about local library, remote components status is always UNPUBLISHED
  publishStatus: string;

  // Whether the component is missing
  // For local comps this can be inferred from parent=null
  // For remote comps if importComponentByKeyAsync() != err
  missing: boolean;

  // The comp is prefixed by "_"
  // !! only really useful for local comps
  private: boolean;

  // Whether the instance is up to date with remote comp
  // getMainComponentAsync() is the currently in use main comp
  // importComponentByKeyAsync() is the library reference
  // !! Only really useful for remote comps
  updated: boolean;

  // The comp parent
  // Useful for checking if comp is a variant in set
  // Always null for remote comps that are not within set
  parent?: ComponentParent;

  // A list of instances using this main comp
  sourceInstances: {
    id: string;
    name: string;
  }[];
};

export interface MainCompInfo extends MainCompInfoBase {
  // The data from importComponentByKeyAsync(), null if missing
  imported?: MainCompInfoBase | null;
}

export type MsgToUI = {
  content: string;
  data?: any;
};

export type MsgToFigma = {
  action: string;
  data?: any;
};

export type Size = {
  width: number;
  height: number;
};
