import Checkbox from "@/src/components/elements/Checkbox";
import { Detail } from "@/src/components/elements/InputWrapper";
import { cva } from "class-variance-authority";
import * as React from "react";
import { forwardRef, memo, useEffect, useState } from "react";

import styles from "@/src/components/compositions/Filters.module.scss";

const clsFilters = cva(styles.Filters, {
  variants: {
    visible: {
      true: [styles.Visible],
      false: [],
    },
  },
  defaultVariants: {
    visible: false,
  },
});

export type Options = {
  inSelection: boolean;
  unnestedOnly: boolean;
  visibleInstances: boolean;
  hiddenInstances: boolean;
  updatedInstances: boolean;
  outdatedInstances: boolean;
  missingMainComp: boolean;
  existingMainComp: boolean;
  localMainComp: boolean;
  remoteMainComp: boolean;
};

export const defaultFilters = {
  inSelection: false,
  unnestedOnly: false,
  visibleInstances: false,
  hiddenInstances: false,
  updatedInstances: false,
  outdatedInstances: false,
  missingMainComp: false,
  existingMainComp: false,
  localMainComp: false,
  remoteMainComp: false,
};

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  classes?: string[];
  visible: boolean;
  onFiltering: (newFilters: Options) => void;
  clearFilters: boolean;
}

/**
 * Filters
 * The filtering available in a dropdown.
 */
export const Filters = forwardRef<HTMLDivElement, Props>(
  ({ classes, visible, onFiltering, clearFilters, ...props }: Props, ref) => {
    const [inSelection, setInSelection] = useState(defaultFilters.inSelection);
    const [unnestedOnly, setUnnestedOnly] = useState(
      defaultFilters.unnestedOnly,
    );
    const [visibleInstances, setVisibleInstances] = useState(
      defaultFilters.visibleInstances,
    );
    const [hiddenInstances, setHiddenInstances] = useState(
      defaultFilters.hiddenInstances,
    );
    const [updatedInstances, setUpdatedInstances] = useState(
      defaultFilters.updatedInstances,
    );
    const [outdatedInstances, setOutdatedInstances] = useState(
      defaultFilters.outdatedInstances,
    );
    const [missingMainComp, setMissingMainComp] = useState(
      defaultFilters.missingMainComp,
    );
    const [existingMainComp, setExistingMainComp] = useState(
      defaultFilters.existingMainComp,
    );
    const [localMainComp, setLocalMainComp] = useState(
      defaultFilters.localMainComp,
    );
    const [remoteMainComp, setRemoteMainComp] = useState(
      defaultFilters.remoteMainComp,
    );

    /**
     * Always keep one of visible/hidden active.
     * Otherwise the list would be empty.
     */
    useEffect(() => {
      if (visibleInstances && hiddenInstances) {
        setHiddenInstances(false);
      }
    }, [visibleInstances]);

    useEffect(() => {
      if (hiddenInstances && visibleInstances) {
        setVisibleInstances(false);
      }
    }, [hiddenInstances]);

    /**
     * Always keep one of updated/outdated active.
     * Otherwise the list would be empty.
     */
    useEffect(() => {
      if (updatedInstances && outdatedInstances) {
        setOutdatedInstances(false);
      }
    }, [updatedInstances]);

    useEffect(() => {
      if (outdatedInstances && updatedInstances) {
        setUpdatedInstances(false);
      }
    }, [outdatedInstances]);

    /**
     * Always keep one of missing/existing active.
     * Otherwise the list would be empty.
     */
    useEffect(() => {
      if (missingMainComp && existingMainComp) {
        setExistingMainComp(false);
      }
    }, [missingMainComp]);

    useEffect(() => {
      if (existingMainComp && missingMainComp) {
        setMissingMainComp(false);
      }
    }, [existingMainComp]);

    /**
     * Always keep one of local/remote active.
     * Otherwise the list would be empty.
     */
    useEffect(() => {
      if (localMainComp && remoteMainComp) {
        setRemoteMainComp(false);
      }
    }, [localMainComp]);

    useEffect(() => {
      if (remoteMainComp && localMainComp) {
        setLocalMainComp(false);
      }
    }, [remoteMainComp]);

    /**
     * Push filters to parent
     */
    useEffect(() => {
      onFiltering({
        inSelection,
        unnestedOnly,
        visibleInstances,
        hiddenInstances,
        updatedInstances,
        outdatedInstances,
        missingMainComp,
        existingMainComp,
        localMainComp,
        remoteMainComp,
      });
    }, [
      inSelection,
      unnestedOnly,
      visibleInstances,
      hiddenInstances,
      updatedInstances,
      outdatedInstances,
      missingMainComp,
      existingMainComp,
      localMainComp,
      remoteMainComp,
    ]);

    /**
     * Reset filters
     */
    useEffect(() => {
      if (clearFilters) {
        setInSelection(false);
        setUnnestedOnly(false);
        setVisibleInstances(false);
        setHiddenInstances(false);
        setUpdatedInstances(false);
        setOutdatedInstances(false);
        setMissingMainComp(false);
        setExistingMainComp(false);
        setLocalMainComp(false);
        setRemoteMainComp(false);
      }
    }, [clearFilters]);

    const cls = cva(classes);

    const [selection, setSelection] = useState<number>();

    // Figma: Receive
    useEffect(() => {
      const handle = ({ data: { pluginMessage: msg } }: MessageEvent) => {
        if (msg.content == "run") {
          setSelection(msg.data.count);
        }
        if (msg.content == "selectionchange") setSelection(msg.data.count);
      };

      window.addEventListener("message", handle);
      return () => window.removeEventListener("message", handle);
    }, []);

    return (
      <div
        ref={ref}
        className={clsFilters({ visible: visible, className: cls() })}
        {...props}
      >
        <div className={styles.Section}>
          <h5>Filter</h5>
          <div className={styles.SectionControls}>
            <Checkbox
              label="In selection only"
              detail={
                <>
                  <p>
                    Search and filter current selection, not the entire page.
                  </p>
                  <p className={styles.CountSelection}>
                    {selection && selection > 0
                      ? selection + ` node${selection == 1 ? "" : "s"} selected`
                      : "No nodes selected"}
                  </p>
                </>
              }
              onClick={() => setInSelection(!inSelection)}
              checked={inSelection}
            />
            <Checkbox
              label="Top level only"
              detail="Don't show nested instances, they inherit changes to their parent comp."
              onClick={() => setUnnestedOnly(!unnestedOnly)}
              checked={unnestedOnly}
            />
          </div>
        </div>
        <div className={styles.Section}>
          <h5>By instance attributes</h5>
          <div className={styles.SectionControls}>
            <div className={styles.ControlGroup}>
              <div className={styles.Group}>
                <Checkbox
                  label="Visible"
                  onClick={() => setVisibleInstances(!visibleInstances)}
                  checked={visibleInstances}
                />
                <Checkbox
                  label="Hidden"
                  onClick={() => setHiddenInstances(!hiddenInstances)}
                  checked={hiddenInstances}
                />
              </div>
              <Detail>
                {!visibleInstances && !hiddenInstances
                  ? "Filter by instance visibility."
                  : visibleInstances
                    ? "Show only visible instances."
                    : "Show only hidden instances."}
              </Detail>
            </div>
            <div className={styles.ControlGroup}>
              <div className={styles.Group}>
                <Checkbox
                  label="Up-to-date"
                  onClick={() => setUpdatedInstances(!updatedInstances)}
                  checked={updatedInstances}
                />
                <Checkbox
                  label="Outdated"
                  onClick={() => setOutdatedInstances(!outdatedInstances)}
                  checked={outdatedInstances}
                />
              </div>
              <Detail>
                {!updatedInstances && !outdatedInstances
                  ? "Filter by sync status."
                  : updatedInstances
                    ? "Show only instances up-to-date with main comp."
                    : "Show only instances with available updates."}
              </Detail>
            </div>
          </div>
        </div>
        <div className={styles.Section}>
          <h5>By main comp attributes</h5>
          <div className={styles.SectionControls}>
            <div className={styles.ControlGroup}>
              <div className={styles.Group}>
                <Checkbox
                  label="Local"
                  checked={localMainComp}
                  onClick={(e) => setLocalMainComp(!localMainComp)}
                />
                <Checkbox
                  label="Remote"
                  checked={remoteMainComp}
                  onClick={(e) => setRemoteMainComp(!remoteMainComp)}
                />
              </div>
              <Detail>
                {!localMainComp && !remoteMainComp
                  ? "Filter by main comp origin."
                  : localMainComp
                    ? "Main comp is in local library."
                    : "Main comp is in remote library."}
              </Detail>
            </div>
            <div className={styles.ControlGroup}>
              <div className={styles.Group}>
                <Checkbox
                  label="Existing"
                  checked={existingMainComp}
                  onClick={(e) => setExistingMainComp(!existingMainComp)}
                />
                <Checkbox
                  label="Missing"
                  checked={missingMainComp}
                  onClick={(e) => setMissingMainComp(!missingMainComp)}
                />
              </div>
              <Detail>
                {!existingMainComp && !missingMainComp
                  ? "Filter by main comp health."
                  : existingMainComp
                    ? "Main comp exists in library."
                    : "Main comp deleted or private."}
              </Detail>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
Filters.displayName = "Filters";

export default memo(Filters);
