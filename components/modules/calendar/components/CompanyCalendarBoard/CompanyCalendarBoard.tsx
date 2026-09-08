"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Users } from "lucide-react";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import type { CompanyCalendarMark, CompanyCalendarUser } from "@/models/calendar";
import { WEEKDAY_SHORT, toISO } from "@/components/modules/calendar/lib/dateRange";

type Props = {
  days: Date[];
  users: CompanyCalendarUser[];
  marks: CompanyCalendarMark[];
  todayISO: string;
  /** True for a day the company does not work — built from its configured working week. */
  isNonWorkingDay: (d: Date) => boolean;
  density: "month" | "week";
  animationKey: string;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

const NAME_COL = 200;
const WEEKDAY_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

/** rose-100 — written out because the half-day fill is a gradient stop, not a utility class. */
const HOLIDAY_FILL = "#ffe4e6";

/**
 * One person's marks, clipped to the visible days and turned into column spans.
 *
 * A bar is **one holiday**, not a run of adjacent days: two different holidays that happen to touch
 * — Christmas Eve on the 24th and a Christmas Break spanning the 25th–26th — stay two bars, because
 * merging them would have to throw one of the names away. A multi-day holiday is already one span
 * by the time it arrives here; nothing is grouped on this side.
 */
type Segment = {
  key: string;
  mark: CompanyCalendarMark;
  startCol: number;
  endCol: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

const toSegments = (marks: CompanyCalendarMark[], dayISOs: string[]): Segment[] => {
  if (dayISOs.length === 0) return [];
  const first = dayISOs[0];
  const last = dayISOs[dayISOs.length - 1];

  return marks
    .filter((m) => m.startDate <= last && m.endDate >= first)
    .map((m) => {
      const startISO = m.startDate < first ? first : m.startDate;
      const endISO = m.endDate > last ? last : m.endDate;
      return {
        key: `${m.id}-${m.calendarId}-${startISO}`,
        mark: m,
        startCol: dayISOs.indexOf(startISO),
        endCol: dayISOs.indexOf(endISO),
        continuesLeft: m.startDate < first,
        continuesRight: m.endDate > last,
      };
    })
    .filter((s) => s.startCol !== -1 && s.endCol !== -1);
};

const titleFor = (m: CompanyCalendarMark): string => {
  const parts = [m.name];
  // The board draws half a day and leave counting charges a whole one. Both are deliberate — exact
  // half-day arithmetic arrives with hourly absence, which does not exist — but the two screens were
  // disagreeing in silence, and the person reading them is the one who loses the day.
  if (m.dayPart === "HALF_DAY") parts.push("(half day — leave still counts it as a whole day)");
  if (m.nominalDate) parts.push(`— moved from ${m.nominalDate}`);
  return m.calendarName ? `${parts.join(" ")} · ${m.calendarName}` : parts.join(" ");
};

export const CompanyCalendarBoard: FC<Props> = ({
  days,
  users,
  marks,
  todayISO,
  isNonWorkingDay,
  density,
  animationKey,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const dayISOs = useMemo(() => days.map(toISO), [days]);

  const marksByUser = useMemo(() => {
    const map = new Map<string, CompanyCalendarMark[]>();
    for (const m of marks) {
      const list = map.get(m.userId) ?? [];
      list.push(m);
      map.set(m.userId, list);
    }
    return map;
  }, [marks]);

  const gridTemplateColumns = `${NAME_COL}px repeat(${days.length}, minmax(0, 1fr))`;
  const showEmpty = !isLoading && users.length === 0;

  // Paging follows the scroll instead of a button: the button had to lie about how much was left
  // anyway, and with the roster no longer resetting when the window moves there is nothing for a
  // reader to re-click.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <style>{`@keyframes calFade{from{opacity:0}to{opacity:1}}`}</style>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div key={animationKey} style={{ animation: "calFade 220ms ease-out" }}>
          {/* Header */}
          <div className="sticky top-0 z-20 grid w-full text-sm" style={{ gridTemplateColumns }}>
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
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {isLoading && users.length === 0
            ? Array.from({ length: 12 }).map((_, r) => (
                <div key={`skel-${r}`} className="grid w-full text-sm" style={{ gridTemplateColumns }}>
                  <div className="sticky left-0 z-10 border-b border-r border-brown-200 bg-white px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  {dayISOs.map((iso) => (
                    <div key={`skel-${r}-${iso}`} className="min-h-[44px] border-b border-r border-brown-100" />
                  ))}
                </div>
              ))
            : users.map((u) => {
                const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
                const segments = toSegments(marksByUser.get(u.id) ?? [], dayISOs);

                return (
                  <div
                    key={u.id}
                    className="relative grid w-full text-sm"
                    style={{ gridTemplateColumns }}
                  >
                    <div className="sticky left-0 z-10 border-b border-r border-brown-200 bg-white px-3 py-2">
                      <UserChip
                        id={u.id}
                        name={fullName}
                        avatarUrl={u.avatarUrl}
                        firstName={u.firstName}
                        lastName={u.lastName}
                        email={u.email}
                      />
                    </div>

                    {days.map((d, i) => {
                      const iso = dayISOs[i];
                      const today = iso === todayISO;
                      const weekend = isNonWorkingDay(d);
                      return (
                        <div
                          key={`${u.id}-${iso}`}
                          className={[
                            "min-h-[44px] border-b border-r border-brown-100",
                            today ? "bg-brown-50" : weekend ? "bg-brown-50/50" : "",
                          ].join(" ")}
                        />
                      );
                    })}

                    {/* Bars, laid over the day cells in a grid with the same columns. The name
                        column is skipped by starting every span at column 2. */}
                    {segments.length > 0 ? (
                      <div
                        className="pointer-events-none absolute inset-x-0 inset-y-1.5 grid"
                        style={{ gridTemplateColumns }}
                      >
                        {segments.map((seg) => (
                          <div
                            key={seg.key}
                            title={titleFor(seg.mark)}
                            style={{
                              gridColumn: `${seg.startCol + 2} / ${seg.endCol + 3}`,
                              gridRow: 1,
                              // A half day is painted half — the fill stops halfway up the bar, so
                              // the day still reads as a day off without claiming the whole of it.
                              ...(seg.mark.dayPart === "HALF_DAY"
                                ? {
                                    backgroundImage: `linear-gradient(to top, ${HOLIDAY_FILL} 50%, transparent 50%)`,
                                  }
                                : { backgroundColor: HOLIDAY_FILL }),
                            }}
                            className={[
                              "pointer-events-auto flex items-center overflow-hidden border border-rose-200 text-[11px] leading-none text-rose-800",
                              seg.continuesLeft ? "rounded-l-none border-l-0" : "ml-1 rounded-l-md",
                              seg.continuesRight ? "rounded-r-none border-r-0" : "mr-1 rounded-r-md",
                            ].join(" ")}
                          >
                            {/* The name only where it fits. At month density a day column is a
                                fraction of the row, so the tooltip carries it instead. */}
                            {density === "week" && !seg.continuesLeft ? (
                              <span className="truncate px-1.5">{seg.mark.name}</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}

          {hasMore ? (
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
