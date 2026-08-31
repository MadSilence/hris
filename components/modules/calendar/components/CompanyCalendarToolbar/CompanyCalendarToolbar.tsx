"use client";

import { FC, useEffect, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Filter as FilterIcon, Search, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/public/desact/src/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { CalendarView } from "@/models/calendarView";

type Density = "month" | "week";

type Props = {
  query: string;
  onQueryChange: (next: string) => void;

  fields: FieldDTO[] | undefined;
  filters: FilterDTO[];
  onFiltersChange: (next: FilterDTO[]) => void;

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
};

export const CompanyCalendarToolbar: FC<Props> = ({
  query,
  onQueryChange,
  fields,
  filters,
  onFiltersChange,
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
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDTO[]>(filters);
  const [seed, setSeed] = useState(0);

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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            className="h-9 w-[240px] pl-9"
            placeholder="Search people"
            inputMode="search"
          />
        </div>

        {/* The same builder and the same DSL as the people table, so the calendar inherits the whole
            operator set — custom attributes included — instead of a second filter implementation.
            Field access is enforced under the seam: filtering on a field you cannot read is a way of
            reading it. */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <FilterIcon className="h-4 w-4" />
              Filter
              {filters.length > 0 ? (
                <Badge variant="secondary" className="ml-1 px-1.5">
                  {filters.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
            <AudienceBuilder key={seed} fields={fields} value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft([])}>
                Reset
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={viewsOpen} onOpenChange={setViewsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Bookmark className="h-4 w-4" />
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
                "flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-brown-50",
                activeViewId === null ? "font-medium text-brown-800" : "text-brown-600",
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
                    "flex-1 truncate rounded px-2 py-1.5 text-left text-sm hover:bg-brown-50",
                    v.id === activeViewId ? "font-medium text-brown-800" : "text-brown-600",
                  ].join(" ")}
                >
                  {v.name}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${v.name}`}
                  disabled={viewsBusy}
                  onClick={() => onDeleteView(v)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <div className="mt-1 border-t border-brown-100 pt-1">
              <Button
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
        <div className="flex items-center rounded-md border border-brown-200 p-0.5">
          {(["week", "month"] as Density[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDensityChange(d)}
              className={[
                "rounded px-3 py-1 text-sm capitalize transition-colors",
                density === d ? "bg-brown-100 font-medium text-brown-800" : "text-brown-500 hover:text-brown-700",
              ].join(" ")}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Previous" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={onToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Next" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-9 min-w-[190px] items-center justify-center rounded-md border border-brown-200 px-3 text-sm font-medium text-foreground">
          {periodLabel}
        </div>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={saveName}
            placeholder="View name"
            onChange={(e) => setSaveName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && saveName.trim()) {
                onSaveView(saveName.trim());
                setSaveOpen(false);
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            A view remembers the filters and the week/month choice — not the period. Opened in June it
            shows June.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
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
