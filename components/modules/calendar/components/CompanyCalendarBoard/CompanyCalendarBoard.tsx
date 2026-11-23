"use client";

import { FC, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { CompanyCalendarAbsence, CompanyCalendarMark, CompanyCalendarUser } from "@/models/calendar";
import { MONTH_KEYS, WEEKDAY_KEYS, addDays, toISO } from "@/components/modules/calendar/lib/dateRange";
import {
  DAY_ROW_H,
  EXTEND_BY,
  MONTHS_ROW_H,
  NAME_COL,
  dayWidthFor,
  extensionNeeded,
  indexOfISO,
  rangeDays,
  type BoardRange,
  type BoardScale,
} from "@/components/modules/calendar/lib/boardGeometry";
import {
  BoardContext,
  BoardRegistry,
  type BoardGeometry,
  type LeaveDecisions,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";
import {
  CompanyCalendarRow,
  CompanyCalendarSkeletonRow,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";

/** The scroll container's marker, so a group section can find it to load as it nears the screen. */
export const CALENDAR_SCROLL_SELECTOR = "[data-calendar-scroll]";

const NO_ABSENCES: CompanyCalendarAbsence[] = [];

/** Leave and holidays grouped by the row they belong to. */
export const groupByUser = <T extends { userId: string }>(items: readonly T[]): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.userId) ?? [];
    list.push(item);
    map.set(item.userId, list);
  }
  return map;
};

/**
 * The days that are a holiday for every row shown (N25): drawn across the whole column, its header included, instead
 * of once per row. Only a board with rows can say so.
 */
export const columnHolidaysOf = (
  users: readonly CompanyCalendarUser[],
  marks: readonly CompanyCalendarMark[],
  rangeStart: Date,
  dayCount: number,
): Map<number, string> => {
  const out = new Map<number, string>();
  if (users.length === 0) return out;
  const perDay = new Map<number, { users: Set<string>; name: string }>();
  for (const m of marks) {
    const from = Math.max(0, indexOfISO(rangeStart, m.startDate));
    const to = Math.min(dayCount - 1, indexOfISO(rangeStart, m.endDate));
    for (let col = from; col <= to; col += 1) {
      const day = perDay.get(col) ?? { users: new Set<string>(), name: m.name };
      day.users.add(m.userId);
      perDay.set(col, day);
    }
  }
  const shown = new Set(users.map((u) => u.id));
  for (const [col, day] of perDay) {
    if ([...shown].every((id) => day.users.has(id))) out.set(col, day.name);
  }
  return out;
};

type Props = {
  range: BoardRange;
  scale: BoardScale;
  todayISO: string;
  /** True for a day the company does not work — built from its configured working week. */
  isNonWorkingDay: (d: Date) => boolean;
  /** The reader nears an end: load more days there. */
  onExtend: (direction: "forward" | "back", days: number) => void;
  /** Scroll so this day is the first one on screen — on load, on Today, on a change of scale. */
  scrollTarget: { iso: string; nonce: number };
  /** The days on screen, for the address, Share and Export. */
  onVisibleChange: (firstISO: string, lastISO: string) => void;

  users: CompanyCalendarUser[];
  marks: CompanyCalendarMark[];
  absences?: CompanyCalendarAbsence[];
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** Whether the reader may ask for leave on a row, and what to do with the days they drag across. */
  requestFor?: (user: CompanyCalendarUser) => ((startISO: string, endISO: string) => void) | undefined;
  decisions: LeaveDecisions;

  /** A grouped board's body — group bands with their own rows — drawn in place of the flat rows. */
  grouped?: ReactNode;
  /** Empty, no results, error: drawn over the free area under the date rows, the header kept. */
  overlay?: ReactNode;
  /** Changing it scrolls the board back to the top — a new grouping is a new shape, not a scroll. */
  scrollResetKey?: string;
};

/**
 * The company calendar's board (N01, N02): a fixed people column and the days, a months row over weekday letters
 * over day numbers. It scrolls sideways without end — more days are loaded as the reader nears either end — and down
 * through the people, the header fixed. A month is 38 px days, as many as fit; a week is seven that fill the board.
 *
 * What is the board's is drawn once behind every row: the 1 px day dividers, the month starts (1.5 px gray-300),
 * solid Mist weekends, a column-wide holiday when it is everyone's (N25), and today — an accent circle on the date
 * and a 2 px accent line down the whole board, under the pills, that never breaks.
 */
export const CompanyCalendarBoard: FC<Props> = ({
  range,
  scale,
  todayISO,
  isNonWorkingDay,
  onExtend,
  scrollTarget,
  onVisibleChange,
  users,
  marks,
  absences = NO_ABSENCES,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  requestFor,
  decisions,
  grouped,
  overlay,
  scrollResetKey,
}) => {
  const t = useTranslations("calendar");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const dayW = dayWidthFor(scale, boardWidth);
  const days = useMemo(() => rangeDays(range), [range]);
  const todayIndex = indexOfISO(range.start, todayISO);
  const headerHeight = MONTHS_ROW_H + DAY_ROW_H[scale];
  const isGrouped = grouped !== undefined;

  const marksByUser = useMemo(() => groupByUser(marks), [marks]);
  const absencesByUser = useMemo(() => groupByUser(absences), [absences]);
  const columnHolidays = useMemo(
    () => (isGrouped ? new Map<number, string>() : columnHolidaysOf(users, marks, range.start, range.length)),
    [isGrouped, users, marks, range],
  );

  const registry = useRef(new BoardRegistry()).current;
  useEffect(() => {
    if (isGrouped) return;
    registry.set("flat", users, absences);
    return () => registry.delete("flat");
  }, [registry, isGrouped, users, absences]);

  const [picked, setPicked] = useState<{ from: number; to: number } | null>(null);
  const geometry = useMemo<BoardGeometry>(
    () => ({
      rangeStart: range.start,
      dayCount: range.length,
      dayW,
      scale,
      isNonWorkingDay,
      todayIndex,
      columnHolidays,
      headerHeight,
    }),
    [range, dayW, scale, isNonWorkingDay, todayIndex, columnHolidays, headerHeight],
  );
  const context = useMemo(
    () => ({ geometry, registry, decisions, picked, setPicked }),
    [geometry, registry, decisions, picked],
  );

  // ── Width: a week's days are a seventh of it ──
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    setBoardWidth(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setBoardWidth(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ── Where the board stands: the first day on screen, kept through every change of width, scale and range ──
  const anchor = useRef<string>(scrollTarget.iso);
  const restore = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollLeft = Math.max(0, indexOfISO(range.start, anchor.current)) * dayW;
  }, [range.start, dayW]);
  useLayoutEffect(() => {
    anchor.current = scrollTarget.iso;
    restore();
    // Only a new target moves the board; the other dependencies are restored by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTarget.nonce]);
  useLayoutEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollResetKey]);

  // ── Scrolling: report what is on screen, and load more days near either end ──
  const asked = useRef<string | null>(null);
  const frame = useRef(0);
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (!node) return;
      const viewport = node.clientWidth - NAME_COL;
      const first = Math.max(0, Math.round(node.scrollLeft / dayW));
      const last = Math.min(range.length - 1, first + Math.max(0, Math.floor(viewport / dayW) - 1));
      anchor.current = toISO(addDays(range.start, first));
      onVisibleChange(anchor.current, toISO(addDays(range.start, last)));

      const need = extensionNeeded(node.scrollLeft, viewport, range.length * dayW);
      // One request per range: the next one waits until this one has arrived.
      const key = `${toISO(range.start)}|${range.length}|${need}`;
      if (need && asked.current !== key) {
        asked.current = key;
        onExtend(need, EXTEND_BY[scale]);
      }
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  // The first report, once the board has a width.
  useEffect(() => {
    if (boardWidth > 0) onScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardWidth, range, scale]);

  // ── Paging the people follows the scroll ──
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (isGrouped || !node || !hasMore || isLoadingMore || !onLoadMore || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && onLoadMore(), {
      root: scrollRef.current,
      rootMargin: "200px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [isGrouped, hasMore, isLoadingMore, onLoadMore]);

  const width = NAME_COL + range.length * dayW;
  const months = useMemo(() => monthSegments(days), [days]);

  return (
    <BoardContext.Provider value={context}>
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-divider bg-card"
        style={{ ["--holiday-tint" as string]: "color-mix(in srgb, var(--accent) 9%, transparent)" }}
      >
        <div ref={scrollRef} data-calendar-scroll="" onScroll={onScroll} className="min-h-0 flex-1 overflow-auto">
          <div className="relative" style={{ width }}>
            {/* ── Header: months over weekday letters over dates ── */}
            <div className="sticky top-0 z-30 bg-card" style={{ height: headerHeight, width }}>
              <div className="relative flex" style={{ height: MONTHS_ROW_H }}>
                <div className="sticky left-0 z-10 shrink-0 bg-card" style={{ width: NAME_COL }} />
                <div className="relative flex-1">
                  {months.map((m) => (
                    <div
                      key={m.key}
                      className="absolute inset-y-0"
                      style={{
                        left: m.start * dayW,
                        width: m.length * dayW,
                        boxShadow: m.start > 0 ? "inset 1.5px 0 0 0 var(--gray-300)" : undefined,
                      }}
                    >
                      <span
                        className="sticky flex h-full items-end gap-1 pb-0.5 pl-2 whitespace-nowrap"
                        style={{ left: NAME_COL }}
                      >
                        <span className="font-heading text-body font-semibold text-primary">
                          {t(`months.long.${MONTH_KEYS[m.month]}`)}
                        </span>
                        <span className="text-hint text-tertiary">{m.year}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative flex border-b border-divider" style={{ height: DAY_ROW_H[scale] }}>
                <div className="sticky left-0 z-10 shrink-0 bg-card" style={{ width: NAME_COL }} />
                <div className="relative flex-1">
                  {days.map((d, i) => (
                    <DayHead
                      key={i}
                      day={d}
                      index={i}
                      left={i * dayW}
                      width={dayW}
                      scale={scale}
                      today={i === todayIndex}
                      weekend={isNonWorkingDay(d)}
                      holiday={columnHolidays.get(i)}
                      picked={picked}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="relative isolate" style={{ minHeight: overlay ? 0 : undefined }}>
              <BoardBackdrop days={days} dayW={dayW} todayIndex={todayIndex} isNonWorkingDay={isNonWorkingDay} columnHolidays={columnHolidays} />

              {overlay ? null : isGrouped ? (
                grouped
              ) : isLoading && users.length === 0 ? (
                Array.from({ length: 12 }).map((_, r) => <CompanyCalendarSkeletonRow key={`skel-${r}`} index={r} />)
              ) : (
                users.map((u) => (
                  <CompanyCalendarRow
                    key={u.id}
                    user={u}
                    marks={marksByUser.get(u.id) ?? []}
                    absences={absencesByUser.get(u.id)}
                    onSelectRange={requestFor?.(u)}
                  />
                ))
              )}

              {!overlay && !isGrouped && hasMore ? (
                <div ref={sentinelRef}>
                  {isLoadingMore
                    ? Array.from({ length: 2 }).map((_, r) => <CompanyCalendarSkeletonRow key={`more-${r}`} index={r + 3} />)
                    : <div className="h-px" />}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {overlay ? (
          <div className="absolute inset-x-0 bottom-0 overflow-y-auto bg-card" style={{ top: headerHeight }}>
            {overlay}
          </div>
        ) : null}
      </div>
    </BoardContext.Provider>
  );
};

/** One month's run of days in the loaded range: where it starts, how long, which month. */
const monthSegments = (days: Date[]) => {
  const out: { key: string; start: number; length: number; month: number; year: number }[] = [];
  days.forEach((d, i) => {
    const last = out[out.length - 1];
    if (last && last.month === d.getMonth() && last.year === d.getFullYear()) last.length += 1;
    else out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, start: i, length: 1, month: d.getMonth(), year: d.getFullYear() });
  });
  return out;
};

/**
 * One day in the header. Month: the weekday letter 10/12 over the date in a 24 circle. Week (N02): "Mon" over the
 * date, both centred over the column. Today: the date in an accent circle and the letter in accent, a 2 px accent
 * line dropping from the circle. A holiday for everyone shown (N25): the cell in the holiday tint, letter and date in
 * accent, no circle.
 */
const DayHead: FC<{
  day: Date;
  index: number;
  left: number;
  width: number;
  scale: BoardScale;
  today: boolean;
  weekend: boolean;
  holiday?: string;
  picked: { from: number; to: number } | null;
}> = ({ day, index, left, width, scale, today, weekend, holiday, picked }) => {
  const t = useTranslations("calendar");
  const inPick = picked !== null && index >= picked.from && index <= picked.to;
  const pickEnd = picked !== null && (index === picked.from || index === picked.to);
  const week = scale === "week";
  return (
    <div
      data-today={today || undefined}
      className={cn("absolute inset-y-0 flex flex-col items-center justify-end gap-0.5 pb-1.5", weekend && !holiday && "bg-subtle")}
      style={{ left, width, backgroundColor: holiday ? "var(--holiday-tint)" : undefined }}
      title={holiday}
    >
      <span
        className={cn(
          "font-medium",
          week && "text-hint",
          today || holiday ? "text-accent-text" : "text-tertiary",
        )}
        // The month's weekday letter is 10/12 (`k-dn .w`), a size no type role has.
        style={week ? undefined : { fontSize: 10, lineHeight: "12px" }}
      >
        {t(`weekdays.${week ? "short" : "narrow"}.${WEEKDAY_KEYS[day.getDay()]}`)}
      </span>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-pill tabular-nums",
          week ? "size-6.5 font-heading text-card-title" : "size-6 text-hint font-medium",
          today
            ? "bg-accent font-semibold text-on-accent"
            : holiday
              ? "text-accent-text"
              : pickEnd
                ? "bg-accent-muted font-semibold text-accent-text"
                : inPick
                  ? "font-semibold text-accent-text"
                  : weekend
                    ? "text-disabled"
                    : "text-secondary",
        )}
      >
        {day.getDate()}
      </span>
      {today ? (
        <span aria-hidden className="absolute bottom-0 left-1/2 h-1.5 w-0.5 -translate-x-1/2 bg-accent" />
      ) : null}
    </div>
  );
};

/**
 * What is the board's, drawn once behind every row: weekends, a holiday that is everyone's, the day dividers, the
 * month starts, and today's line — above the rows' tints, under the pills (z 5 against their 10).
 */
const BoardBackdrop: FC<{
  days: Date[];
  dayW: number;
  todayIndex: number;
  isNonWorkingDay: (d: Date) => boolean;
  columnHolidays: ReadonlyMap<number, string>;
}> = ({ days, dayW, todayIndex, isNonWorkingDay, columnHolidays }) => (
  <>
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0" style={{ left: NAME_COL }}>
      {days.map((d, i) =>
        columnHolidays.has(i) ? (
          <div key={i} className="absolute inset-y-0" style={{ left: i * dayW, width: dayW, backgroundColor: "var(--holiday-tint)" }} />
        ) : isNonWorkingDay(d) ? (
          <div key={i} className="absolute inset-y-0 bg-subtle" style={{ left: i * dayW, width: dayW }} />
        ) : null,
      )}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `repeating-linear-gradient(to right, var(--border-divider) 0 1px, transparent 1px ${dayW}px)` }}
      />
      {days.map((d, i) =>
        i > 0 && d.getDate() === 1 ? (
          <div key={`m-${i}`} className="absolute inset-y-0" style={{ left: i * dayW, width: 1.5, backgroundColor: "var(--gray-300)" }} />
        ) : null,
      )}
    </div>
    {todayIndex >= 0 && todayIndex < days.length ? (
      <div
        aria-hidden
        data-test="today-line"
        className="pointer-events-none absolute inset-y-0 z-[5] w-0.5 -translate-x-1/2 bg-accent"
        style={{ left: NAME_COL + todayIndex * dayW + dayW / 2 }}
      />
    ) : null}
  </>
);
