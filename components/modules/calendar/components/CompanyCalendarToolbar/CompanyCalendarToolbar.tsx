"use client";

import { FC, useEffect, useState, ReactNode } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, Bookmark01Icon, Delete02Icon, FilterHorizontalIcon, LayoutTable01Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Badge } from "@/components/desact/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/desact/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { CalendarView } from "@/models/calendarView";
import type { CompanyCalendarGrouping } from "@/models/calendar";
import { groupingLabel } from "@/components/modules/calendar/lib/grouping";

type Density = "month" | "week";

type Props = {
  query: string;
  onQueryChange: (next: string) => void;

  fields: FieldDTO[] | undefined;
  filters: FilterDTO[];
  onFiltersChange: (next: FilterDTO[]) => void;

  /** Null is a flat board. */
  grouping: CompanyCalendarGrouping | null;
  /** What this reader may group by — a company-wide read on the field. */
  groupingOptions: CompanyCalendarGrouping[];
  onGroupingChange: (next: CompanyCalendarGrouping | null) => void;

  views: CalendarView[];
  activeViewId: string | null;
  viewsBusy?: boolean;
  onApplyView: (view: CalendarView | null) => void;
  onSaveView: (name: string) => void;
  onDeleteView: (view: CalendarView) => void;

  density: Density;
  onDensityChange: (next: Density) => void;

  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Export and print, beside the period: what the board is, carried out or put on paper. */
  actions?: ReactNode;
};

export const CompanyCalendarToolbar: FC<Props> = ({
  query,
  onQueryChange,
  fields,
  filters,
  onFiltersChange,
  grouping,
  groupingOptions,
  onGroupingChange,
  views,
  activeViewId,
  viewsBusy = false,
  onApplyView,
  onSaveView,
  onDeleteView,
  density,
  onDensityChange,
  periodLabel,
  onPrev,
  onNext,
  onToday,
  actions,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDTO[]>(filters);
  const [seed, setSeed] = useState(0);

  const [groupOpen, setGroupOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  // Re-seeding the builder on open discards a half-typed row from the previous visit, which is what
  // the people table does for the same reason.
  useEffect(() => {
    if (filterOpen) {
      setDraft(filters);
      setSeed((s) => s + 1);
    }
  }, [filterOpen, filters]);

  const applyFilters = () => {
    onFiltersChange(draft);
    setFilterOpen(false);
  };

  const activeView = views.find((v) => v.id === activeViewId) ?? null;

  return (
    <div className="flex flex-none flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[240px]">
          <Icon icon={Search01Icon} size="sm" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            className="h-9 w-[240px] pl-9"
            placeholder="Search"
            inputMode="search"
          />
        </div>

        {/* The same builder and the same DSL as the people table, so the calendar inherits the whole
            operator set — custom attributes included — instead of a second filter implementation.
            Field access is enforced under the seam: filtering on a field you cannot read is a way of
            reading it. */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="secondary" className="gap-1.5">
              <Icon icon={FilterHorizontalIcon} size="sm" />
              Filter
              {filters.length > 0 ? (
                <Badge variant="neutral" className="ml-1 px-1.5">
                  {filters.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
            <AudienceBuilder key={seed} fields={fields} value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft([])}>
                Reset
              </Button>
              <Button type="button" size="sm" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* One dimension at a time, never nested. Offered only for a field the reader could filter
            by: a header prints the field's value, so grouping by it is a way of reading it. */}
        {groupingOptions.length > 0 || grouping !== null ? (
          <Popover open={groupOpen} onOpenChange={setGroupOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="secondary" className="gap-1.5">
                <Icon icon={LayoutTable01Icon} size="sm" />
                {grouping ? `Group: ${groupingLabel(grouping)}` : "Group"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[200px] p-2">
              {([null, ...groupingOptions] as (CompanyCalendarGrouping | null)[]).map((option) => (
                <button
                  key={option ?? "none"}
                  type="button"
                  onClick={() => {
                    onGroupingChange(option);
                    setGroupOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-control px-2 py-1.5 text-left text-body hover:bg-subtle",
                    option === grouping ? "font-medium text-primary" : "text-secondary",
                  ].join(" ")}
                >
                  {option ? groupingLabel(option) : "None"}
                  {option === grouping ? <Icon icon={Tick02Icon} size="sm" /> : null}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        ) : null}

        <Popover open={viewsOpen} onOpenChange={setViewsOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="secondary" className="gap-1.5">
              <Icon icon={Bookmark01Icon} size="sm" />
              {activeView ? activeView.name : "Views"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[280px] p-2">
            <button
              type="button"
              onClick={() => {
                onApplyView(null);
                setViewsOpen(false);
              }}
              className={[
                "flex w-full items-center rounded-control px-2 py-1.5 text-left text-body hover:bg-subtle",
                activeViewId === null ? "font-medium text-primary" : "text-secondary",
              ].join(" ")}
            >
              All people
            </button>

            {views.map((v) => (
              <div key={v.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onApplyView(v);
                    setViewsOpen(false);
                  }}
                  className={[
                    "flex-1 truncate rounded-control px-2 py-1.5 text-left text-body hover:bg-subtle",
                    v.id === activeViewId ? "font-medium text-primary" : "text-secondary",
                  ].join(" ")}
                >
                  {v.name}
                </button>
                <Button type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${v.name}`}
                  disabled={viewsBusy}
                  onClick={() => onDeleteView(v)}
                >
                  <Icon icon={Delete02Icon} size="sm" />
                </Button>
              </div>
            ))}

            <div className="mt-1 border-t border-divider pt-1">
              <Button type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={viewsBusy}
                onClick={() => {
                  setSaveName("");
                  setSaveOpen(true);
                  setViewsOpen(false);
                }}
              >
                Save current filters as a view
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-control border border-divider p-0.5">
          {(["week", "month"] as Density[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDensityChange(d)}
              className={[
                "rounded-control px-3 py-1 text-body capitalize transition-colors",
                density === d ? "bg-accent-muted font-medium text-accent-text" : "text-tertiary hover:bg-subtle hover:text-primary",
              ].join(" ")}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" variant="secondary" size="icon" aria-label="Previous" onClick={onPrev}>
            <Icon icon={ArrowLeft01Icon} size="sm" />
          </Button>
          <Button type="button" variant="secondary" onClick={onToday}>
            Today
          </Button>
          <Button type="button" variant="secondary" size="icon" aria-label="Next" onClick={onNext}>
            <Icon icon={ArrowRight01Icon} size="sm" />
          </Button>
        </div>

        <div className="flex h-9 min-w-[190px] items-center justify-center rounded-control border border-divider px-3 text-body font-medium text-primary">
          {periodLabel}
        </div>
        {actions}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={saveName}
            onChange={(e) => setSaveName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && saveName.trim()) {
                onSaveView(saveName.trim());
                setSaveOpen(false);
              }
            }}
          />
          <p className="text-hint text-tertiary">
            A view remembers the filters, the grouping and the week/month choice — not the period.
            Opened in June it shows June.
          </p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button type="button"
              disabled={!saveName.trim() || viewsBusy}
              onClick={() => {
                onSaveView(saveName.trim());
                setSaveOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
