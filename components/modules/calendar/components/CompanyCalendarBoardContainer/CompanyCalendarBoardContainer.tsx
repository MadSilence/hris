"use client";

import { FC, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useCompanyCalendar } from "@/components/modules/calendar/hooks/useCompanyCalendar";
import { CompanyCalendarBoard } from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard";
import {
  MONTH_NAMES,
  addDays,
  addMonths,
  eachDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  toISO,
} from "@/components/modules/calendar/lib/dateRange";

type Density = "month" | "week";

export const CompanyCalendarBoardContainer: FC = () => {
  const [density, setDensity] = useState<Density>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [query, setQuery] = useState("");

  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { from, to } = useMemo(() => {
    if (density === "week") return { from: startOfWeek(anchor), to: endOfWeek(anchor) };
    return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
  }, [density, anchor]);

  const days = useMemo(() => eachDay(from, to), [from, to]);
  const todayISO = toISO(new Date());

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useCompanyCalendar({
    from: toISO(from),
    to: toISO(to),
    q,
  });

  const users = useMemo(() => (data?.pages ?? []).flatMap((p) => p.users), [data]);
  const holidays = useMemo(() => (data?.pages ?? []).flatMap((p) => p.holidays), [data]);

  const goPrev = () => setAnchor((a) => (density === "week" ? addDays(a, -7) : addMonths(a, -1)));
  const goNext = () => setAnchor((a) => (density === "week" ? addDays(a, 7) : addMonths(a, 1)));
  const goToday = () => setAnchor(new Date());

  const label =
    density === "week"
      ? `${MONTH_NAMES[from.getMonth()].slice(0, 3)} ${from.getDate()} – ${MONTH_NAMES[to.getMonth()].slice(0, 3)} ${to.getDate()}, ${to.getFullYear()}`
      : `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Toolbar: search (left) — toggle · arrows(+Today) · period (right) */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-3">
        <div className="relative w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            className="h-9 w-[240px] pl-9"
            placeholder="Search people"
            inputMode="search"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Week / Month toggle */}
          <div className="flex items-center rounded-md border border-brown-200 p-0.5">
            {(["week", "month"] as Density[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                className={[
                  "rounded px-3 py-1 text-sm capitalize transition-colors",
                  density === d ? "bg-brown-100 font-medium text-brown-800" : "text-brown-500 hover:text-brown-700",
                ].join(" ")}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Arrows with Today between */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Previous" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Next" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Current period */}
          <div className="flex h-9 min-w-[190px] items-center justify-center rounded-md border border-brown-200 px-3 text-sm font-medium text-foreground">
            {label}
          </div>
        </div>
      </div>

      <CompanyCalendarBoard
        days={days}
        users={users}
        holidays={holidays}
        todayISO={todayISO}
        density={density}
        animationKey={`${density}|${toISO(from)}`}
        isLoading={isLoading}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => void fetchNextPage()}
      />

      {/* Legend */}
      <div className="flex flex-none items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-rose-400" />
          Public holiday
        </span>
      </div>
    </div>
  );
};

export default CompanyCalendarBoardContainer;
