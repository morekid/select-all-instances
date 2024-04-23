import { Size } from "@/typings-custom/app";

/**
 * UI
 * UI manager class
 *
 * @param size - Maximum number of tasks
 */
export class UI {
  /**
   * Size
   */
  width: number = 480;
  height: number = 776;
  minWidth: number = 270;
  minHeight: number = 330;

  /**
   * Filters
   */
  filtersSidebar: number = 214;

  /**
   * State
   */
  showFilters = false;

  constructor(opts?: {
    size?: { width: number; height: number };
    filtersSidebar?: number;
  }) {
    // Get last stored size from client storage on init
    figma.clientStorage
      .getAsync("size")
      .then((size) => {
        if (size) {
          this.width = size.width;
          this.height = size.height;
        }
      })
      .catch((err) => {});

    if (opts?.size) {
      this.width = opts.size.width;
      this.height = opts.size.height;
    }
    if (opts?.filtersSidebar) {
      this.filtersSidebar = opts.filtersSidebar;
    }
  }

  resize = (
    data:
      | {
          showFilters: boolean;
          currentSize: Size;
        }
      | {
          handle: "right" | "bottomRight" | "bottom";
          currentSize: Size;
        },
  ) => {
    if ("showFilters" in data) {
      this.showFilters = data.showFilters;
      this.constrainSize();
      this.uiResize();
    }

    if ("handle" in data) {
      this.width =
        data.currentSize.width - (this.showFilters ? this.filtersSidebar : 0) ||
        this.width;
      this.height = data.currentSize.height || this.height;
      this.constrainSize();
      this.uiResize();
    }
  };

  uiResize = () => {
    if (this.showFilters) {
      figma.ui.resize(this.width + this.filtersSidebar, this.height);
    } else {
      figma.ui.resize(this.width, this.height);
    }

    figma.clientStorage
      .setAsync("size", { width: this.width, height: this.height })
      .catch((err) => {});
  };

  constrainSize = () => {
    this.width = this.width < this.minWidth ? this.minWidth : this.width;
    this.height = this.height < this.minHeight ? this.minHeight : this.height;
  };

  getSize = () => ({ width: this.width, height: this.height });
  getSizeFilters = () => this.filtersSidebar;
}
