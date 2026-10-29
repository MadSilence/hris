"use client";

import { FC, ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Users } from "lucide-react";
import type {
  CompanyCalendarAbsence,
  CompanyCalendarCapacity,
  CompanyCalendarMark,
  CompanyCalendarUser,
} from "@/models/calendar";
import { CapacityDot } from "@/components/modules/calendar/components/CompanyCalendarBoard/CapacityDot";
import { WEEKDAY_SHORT, toISO } from "@/components/modules/calendar/lib/dateRange";
import {
  CompanyCalendarRow,
  CompanyCalendarSkeletonRow,
  boardGridTemplate,
  useAbsencesByUser,
  useMarksByUser,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";

const NO_ABSENCES: CompanyCalendarAbsence[] = [];
const NO_CAPACITY: CompanyCalendarCapacity[] = [];

/** The scroll container's marker, so a group section can find it to keep its header in view. */
export const CALENDAR_SCROLL_SELECTOR = "[data-calendar-scroll]";
/** The day header's height, published for the group headers that stick just below it. */
export const CALENDAR_HEADER_HEIGHT_VAR = "--cal-header-h";

type Props = {
  days: Date[];
  users: CompanyCalendarUser[];
  marks: CompanyCalendarMark[];
  /** Leave on the same rows; what each bar carries was decided by the server. */
  absences?: CompanyCalendarAbsence[];
  /**
   * Whether the reader may ask for leave on a row — their own, or one they may file for — and what to do
   * with the days they drag across. Undefined for a row they may not.
   */
  requestFor?: (user: CompanyCalendarUser) => ((startISO: string, endISO: string) => void) | undefined;
  /** Company-wide capacity marks, drawn under the day number of an ungrouped board. */
  capacity?: CompanyCalendarCapacity[];
  todayISO: string;
  /** True for a day the company does not work — built from its configured working week. */
  isNonWorkingDay: (d: Date) => boolean;
  density: "month" | "week";
  animationKey: string;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /**
   * A grouped board's body — group headers with their own rows — drawn under the day header in
   * place of the flat rows. `users`, `marks` and the paging props are unused while it is set.
   */
  grouped?: ReactNode;
  /** Overrides the flat board's "nobody matches" test; a grouped board knows it from its groups. */
  isEmpty?: boolean;
  /** Changing it scrolls the board back to the top — a new grouping is a new shape, not a scroll. */
  scrollResetKey?: string;
};

const WEEKDAY_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

export const CompanyCalendarBoard: FC<Props> = ({
  days,
  users,
  marks,
  absences = NO_ABSENCES,
  capacity = NO_CAPACITY,
  requestFor,
  todayISO,
  isNonWorkingDay,
  density,
  animationKey,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  grouped,
  isEmpty,
  scrollResetKey,
}) => {
  const dayISOs = useMemo(() => days.map(toISO), [days]);
  const marksByUser = useMarksByUser(marks);
  const absencesByUser = useAbsencesByUser(absences);
  const capacityByDay = useMemo(() => new Map(capacity.map((c) => [c.date, c])), [capacity]);

  const gridTemplateColumns = boardGridTemplate(days.length);
  const isGrouped = grouped !== undefined;
  const showEmpty = isEmpty ?? (!isLoading && users.length === 0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // Group headers stick just under the day header, so they need its height. Measured rather than
  // assumed: the header's two lines of text are whatever the font makes them.
  useLayoutEffect(() => {
    const header = headerRef.current;
    const scroller = scrollRef.current;
    if (!header || !scroller) return;
    const publish = () =>
      scroller.style.setProperty(CALENDAR_HEADER_HEIGHT_VAR, `${header.offsetHeight}px`);
    publish();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => observer.disconnect();
  }, [animationKey]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollResetKey]);

  // Paging follows the scroll instead of a button: the button had to lie about how much was left
  // anyway, and with the roster no longer resetting when the window moves there is nothing for a
  // reader to re-click.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (isGrouped || !node || !hasMore || isLoadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isGrouped, hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <style>{`@keyframes calFade{from{opacity:0}to{opacity:1}}`}</style>

      <div ref={scrollRef} data-calendar-scroll="" className="min-h-0 flex-1 overflow-y-auto print:overflow-visible">
        <div key={animationKey} style={{ animation: "calFade 220ms ease-out" }}>
          {/* Header */}
          <div ref={headerRef} className="sticky top-0 z-20 grid w-full text-sm" style={{ gridTemplateColumns }}>
            <div className="sticky left-0 z-30 flex items-center border-b border-r border-brown-200 bg-white px-3 py-2 text-xs font-medium text-brown-600">
              People
            </div>
            {days.map((d, i) => {
              const iso = dayISOs[i];
              const today = iso === todayISO;
              const weekend = isNonWorkingDay(d);
              return (
                <div
                  key={`h-${iso}`}
                  className={[
                    "border-b border-r border-brown-100 px-1 py-1.5 text-center",
                    today ? "bg-brown-100" : weekend ? "bg-brown-50" : "bg-white",
                  ].join(" ")}
                >
                  <div className={`text-[10px] uppercase ${today ? "text-brown-700" : "text-brown-400"}`}>
                    {density === "week" ? WEEKDAY_SHORT[d.getDay()] : WEEKDAY_NARROW[d.getDay()]}
                  </div>
                  <div className={`text-xs ${today ? "font-semibold text-brown-800" : "text-foreground"}`}>
                    {d.getDate()}
                  </div>
                  {capacityByDay.has(iso) ? (
                    <div className="flex h-2 justify-center">
                      <CapacityDot mark={capacityByDay.get(iso)!} who="anyone in the company" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {isGrouped
            ? grouped
            : isLoading && users.length === 0
              ? Array.from({ length: 12 }).map((_, r) => (
                  <CompanyCalendarSkeletonRow
                    key={`skel-${r}`}
                    dayISOs={dayISOs}
                    gridTemplateColumns={gridTemplateColumns}
                  />
                ))
              : users.map((u) => (
                  <CompanyCalendarRow
                    key={u.id}
                    user={u}
                    marks={marksByUser.get(u.id) ?? []}
                    absences={absencesByUser.get(u.id)}
                    onSelectRange={requestFor?.(u)}
                    days={days}
                    dayISOs={dayISOs}
                    todayISO={todayISO}
                    isNonWorkingDay={isNonWorkingDay}
                    density={density}
                    gridTemplateColumns={gridTemplateColumns}
                  />
                ))}

          {!isGrouped && hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-3 text-xs text-muted-foreground">
              {isLoadingMore ? "Loading…" : ""}
            </div>
          ) : null}
        </div>
      </div>

      {showEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-50 text-brown-400">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">No people to show</p>
          <p className="max-w-sm text-sm text-muted-foreground">Nobody matches the current view.</p>
        </div>
      ) : null}
    </div>
  );
};
