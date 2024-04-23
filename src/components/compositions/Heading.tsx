import MainCompsLoading from "@/src/components/compositions/MainCompsLoading";
import Button from "@/src/components/elements/Button";
import InputText from "@/src/components/elements/InputText";
import IconFilter from "@/src/components/icons/Filter";
import IconLoading from "@/src/components/icons/Loading";
import IconRefresh from "@/src/components/icons/Refresh";
import IconSelectAll from "@/src/components/icons/SelectAll";
import { MsgToFigma } from "@/typings-custom/app";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

import styles from "@/src/components/compositions/Heading.module.scss";

const cls = cva(styles.Heading);
const clsActions = cva(styles.Actions);

export interface Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cls> {
  onRefresh: Function;
  onSearch: Function;
  onSelectAll: Function;
  onToggleFilters: Function;
  onClearFilters: Function;
  isFiltering: boolean;
  filteredInstancesCount?: number;
}

const Heading = ({
  onRefresh,
  onSearch,
  onSelectAll,
  onToggleFilters,
  onClearFilters,
  isFiltering,
  filteredInstancesCount,
  ...props
}: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [instancesChanged, setInstancesChanged] = useState(false);
  const [clearFiltersAndSearch, setClearFiltersAndSearch] = useState(false);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  // Figma: Receive
  useEffect(() => {
    const handle = ({ data: { pluginMessage: msg } }: MessageEvent) => {
      if (msg.content == "instancesChanged") {
        setInstancesChanged(true);
      }
      if (msg.content == "selectionDone") {
        setIsProcessingSelection(false);
      }
    };

    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  // Show/hide filters
  useEffect(() => {
    onToggleFilters(showFilters);

    parent.postMessage(
      {
        pluginMessage: {
          action: "resize",
          data: {
            showFilters: showFilters,
            currentSize: {
              width: document.body.offsetWidth,
              height: document.body.offsetHeight,
            },
          },
        } as MsgToFigma,
      },
      "*",
    );
  }, [showFilters, onToggleFilters]);

  const handleSearch = useCallback((term: string) => {
    const active = (term && term.length > 0) || false;
    // Set filtering status
    setIsSearching(active);
    // Push to parent
    onSearch(term);
  }, []);

  // Reset clear filters action
  useEffect(() => {
    if (clearFiltersAndSearch) {
      setTimeout(() => setClearFiltersAndSearch(false), 10);
    }
    // Push to parent to clear filters
    onClearFilters(clearFiltersAndSearch);
  }, [clearFiltersAndSearch]);

  return (
    <div className={cls()} {...props}>
      <div className={clsActions()}>
        <div className={styles.Left}>
          <Button
            classes={[styles.Refresh]}
            body="iconOnly"
            intent="secondary"
            onClick={() => {
              setInstancesChanged(false);
              onRefresh();
            }}
            title={
              (instancesChanged ? "Instances changed." : "") +
              "Refresh the list"
            }
          >
            {instancesChanged && <div className={styles.UpdatesDot} />}
            <IconRefresh />
          </Button>
          <InputText
            classes={[styles.Search]}
            placeholder="Search..."
            onChangeValue={handleSearch}
            clearValue={clearFiltersAndSearch}
          />
        </div>
        <div className={styles.Right}>
          <Button
            classes={[styles.SelectAll]}
            startDecorator={
              isProcessingSelection ? <IconLoading /> : <IconSelectAll />
            }
            onClick={() => {
              setIsProcessingSelection(true);
              onSelectAll();
            }}
            disabled={filteredInstancesCount == 0 || isProcessingSelection}
            title="Select all in list"
          >
            Select all
          </Button>
          <Button
            classes={[styles.Filter]}
            state={isFiltering ? "on" : undefined}
            body="iconOnly"
            onClick={() => setShowFilters(!showFilters)}
            title="Show filters"
          >
            <IconFilter />
          </Button>
        </div>
      </div>

      <Counters
        filteredInstancesCount={filteredInstancesCount}
        isFiltering={isFiltering}
        isSearching={isSearching}
        onClearFilters={() => setClearFiltersAndSearch(true)}
      />
    </div>
  );
};

export default Heading;

/**
 * Counters
 * The heading counter displays.
 */
const clsCounters = cva(styles.Counters);

export interface CountersProps extends React.HTMLAttributes<HTMLDivElement> {
  classes?: string[];
  filteredInstancesCount?: number;
  isFiltering: boolean;
  isSearching: boolean;
  onClearFilters: Function;
}
export const Counters = forwardRef<HTMLDivElement, CountersProps>(
  (
    {
      classes,
      filteredInstancesCount,
      isFiltering,
      isSearching,
      onClearFilters,
      ...props
    }: CountersProps,
    ref,
  ) => {
    const [instancesCount, setInstancesCount] = useState<number>();
    const [loading, setLoading] = useState<boolean>();

    // Figma: Receive
    useEffect(() => {
      const handle = ({ data: { pluginMessage: msg } }: MessageEvent) => {
        if (msg.content == "run") {
          setInstancesCount(undefined);
        }

        if (msg.content == "updateTotalListCount")
          setInstancesCount(msg.data.count);

        if (msg.content == "loading") setLoading(msg.data.loading);
      };

      window.addEventListener("message", handle);
      return () => window.removeEventListener("message", handle);
    }, []);

    const none = filteredInstancesCount == 0;
    const subset =
      filteredInstancesCount && filteredInstancesCount != instancesCount;

    return (
      <div ref={ref} className={clsCounters()} {...props}>
        <span className={styles.CountInstances}>
          {loading && <IconLoading />}

          {loading && instancesCount == undefined && (
            <>Finding instances&hellip;</>
          )}

          {instancesCount != undefined && (
            <>
              {(isFiltering || isSearching) &&
                (none
                  ? "Showing none of "
                  : subset
                    ? "Showing " + filteredInstancesCount + " of "
                    : "")}

              {instancesCount + ` instance${instancesCount == 1 ? "" : "s"}`}
            </>
          )}

          {isFiltering || isSearching ? (
            <a className="link" onClick={() => onClearFilters()}>
              Clear
            </a>
          ) : null}
        </span>

        <MainCompsLoading />
      </div>
    );
  },
);
