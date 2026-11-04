"use client";

import { partsToISO as toISO } from "@/lib/date";
import { expandSpanToDays, nonWorkingDayTest } from "@/components/modules/calendar/lib/dateRange";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";

import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import type { CSSProperties } from "react";
import { toTagColor } from "@/lib/theme/tags";

export type CalendarHolidayEvent = {
  id: string;
  name: string;
  date: string;
  calendarName?: string | null;
};

export type CalendarTimeOffEvent = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  tone: "approved" | "pending";
  /** The leave type's tag colour (SPEC § 13.13); gray when it is not known. */
  color?: string | null;
};

/**
 * One day, as the grid already knows it. Handed to `renderDay` so a caller never
 * re-derives "is this a holiday, is it leave" from data the calendar is holding in front of it.
 */
export type CalendarDayInfo = {
  iso: string;
  inMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isHoliday: boolean;
  isTimeOff: boolean;
};

type Props = {
  holidays: CalendarHolidayEvent[];
  timeOff: CalendarTimeOffEvent[];
  isLoading?: boolean;
  variant?: "full" | "compact";
  /** Optional control rendered at the right edge of the toolbar (e.g. "Request time off"). */
  headerAction?: ReactNode;
  /**
   * Called when the user picks a day (click → same start/end) or drags across days. Enabling this
   * turns day cells into a selectable range. Dates are inclusive ISO strings (YYYY-MM-DD).
   */
  onSelectRange?: (startISO: string, endISO: string) => void;
  /**
   * The span drawn as picked, after the drag has finished — `onSelectRange` reports it, this keeps it
   * on screen. A single day is `start === end`. The run is filled, and its first and last day carry a
   * ring, so a span of one and a span of five are obviously the same kind of thing.
   */
  selectedRange?: { start: string; end: string } | null;
  /**
   * The toolbar's shape. `grouped` — the month, `Today` and the arrows together on the left, the
   * action on the right. `split` — an arrow at each edge with the month centred between them: a
   * stepper, for a grid read one month at a time; `Today` sits in a row under it, shown only away
   * from the current month.
   */
  toolbar?: "grouped" | "split";
  /** Extra content inside every day cell — Attendance draws the hours recorded on the day. */
  renderDay?: (day: CalendarDayInfo) => ReactNode;
  /** Told the visible month (`yyyy-MM`) on mount and on every step — Attendance reads the month's log. */
  onMonthChange?: (month: string) => void;
  /**
   * Drawn under the grid, given every day on screen — every week row, leading and trailing days
   * included. For the summary of a month a caller cannot otherwise write: the visible month is this
   * component's own state.
   */
  footer?: (visibleDays: CalendarDayInfo[]) => ReactNode;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const weekdayOffset = (jsDay: number) => (jsDay + 6) % 7;

/** How many week-rows a month spans, leading and trailing days of its neighbours included. */
const weeksInMonth = (year: number, month: number) =>
  Math.ceil((weekdayOffset(new Date(year, month, 1).getDay()) + new Date(year, month + 1, 0).getDate()) / 7);

type DayCell = {
  iso: string;
  dayNumber: number;
  inMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  dayHolidays: CalendarHolidayEvent[];
};

type TimeOffSegment = {
  id: string;
  label: string;
  tone: CalendarTimeOffEvent["tone"];
  color?: string | null;
  startCol: number; // 0..6 within the week
  endCol: number; // 0..6 within the week
  continuesLeft: boolean;
  continuesRight: boolean;
  lane: number;
};

/**
 * A leave bar as the company calendar draws one (SPEC § 13.13): approved is a solid bar in the leave type's tag
 * colour, pending its light tint under a 1.5 px edge and a 4 px dot pattern — so the two differ in print too.
 */
const timeOffStyle = (tone: CalendarTimeOffEvent["tone"], color?: string | null): CSSProperties => {
  const tag = toTagColor(color);
  const bar = `var(--tag-${tag}-bar)`;
  if (tone === "approved") return { backgroundColor: bar, borderColor: bar, color: "var(--text-inverse)" };
  return {
    backgroundColor: `var(--tag-${tag}-bg)`,
    borderColor: bar,
    color: `var(--tag-${tag}-text)`,
    backgroundImage: `radial-gradient(${bar} 0.75px, transparent 1px)`,
    backgroundSize: "4px 4px",
  };
};

/**
 * Lays out the time-off events overlapping one week as continuous bars: each event is clipped to the
 * week's [start,end], turned into a column span, and packed into lanes so bars never overlap. Events
 * spanning past a week edge are flagged so their corners stay square (implying continuation).
 */
function buildWeekSegments(weekCells: DayCell[], timeOff: CalendarTimeOffEvent[]): TimeOffSegment[] {
  const weekStart = weekCells[0].iso;
  const weekEnd = weekCells[weekCells.length - 1].iso;

  const raw = timeOff
    .filter((t) => t.startDate <= weekEnd && t.endDate >= weekStart)
    .map((t) => {
      const segStartISO = t.startDate < weekStart ? weekStart : t.startDate;
      const segEndISO = t.endDate > weekEnd ? weekEnd : t.endDate;
      const startCol = weekCells.findIndex((c) => c.iso === segStartISO);
      const endCol = weekCells.findIndex((c) => c.iso === segEndISO);
      return {
        id: t.id,
        label: t.label,
        tone: t.tone,
        color: t.color,
        startCol,
        endCol,
        continuesLeft: t.startDate < weekStart,
        continuesRight: t.endDate > weekEnd,
      };
    })
    .filter((s) => s.startCol !== -1 && s.endCol !== -1)
    .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

  // Greedy lane packing: reuse the first lane whose last bar ended before this one starts.
  const laneEnds: number[] = [];
  return raw.map((s) => {
    let lane = laneEnds.findIndex((end) => end < s.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(s.endCol);
    } else {
      laneEnds[lane] = s.endCol;
    }
    return { ...s, lane };
  });
}

export const UserCalendar: FC<Props> = ({
  holidays,
  timeOff,
  isLoading = false,
  variant = "full",
  headerAction,
  onSelectRange,
  selectedRange = null,
  toolbar = "grouped",
  renderDay,
  onMonthChange,
  footer,
}) => {
  const compact = variant === "compact";
  const selectable = Boolean(onSelectRange);
  const gridClass = "grid grid-cols-7";
  // The company's own week, not a hardcoded Saturday/Sunday — shared with the company board so the
  // two calendars cannot drift apart, and matching what the backend counts.
  const { company } = useCompanyData();
  const isNonWorkingDay = useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);
  // Memoised so the month grid's useMemo does not see a new Date identity on every render.
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  useEffect(() => {
    onMonthChange?.(`${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`);
  }, [cursor, onMonthChange]);

  // In-progress drag selection ({anchor, hover}); resolved to a range on pointer-up.
  const [drag, setDrag] = useState<{ anchor: string; hover: string } | null>(null);
  const selRange = drag
    ? { start: drag.anchor <= drag.hover ? drag.anchor : drag.hover, end: drag.anchor <= drag.hover ? drag.hover : drag.anchor }
    : null;

  useEffect(() => {
    if (!drag) return;
    // The range used to be reported from inside the setDrag updater. React runs updaters during
    // the render phase, so calling the parent's setState from there warned about updating one
    // component while rendering another. The effect re-subscribes whenever `drag` changes, so the
    // closure already holds the current value — no updater needed.
    const finish = () => {
      const start = drag.anchor <= drag.hover ? drag.anchor : drag.hover;
      const end = drag.anchor <= drag.hover ? drag.hover : drag.anchor;
      setDrag(null);
      onSelectRange?.(start, end);
    };
    window.addEventListener("pointerup", finish);
    return () => window.removeEventListener("pointerup", finish);
  }, [drag, onSelectRange]);

  const holidaysByDay = useMemo(() => {
    const map = new Map<string, CalendarHolidayEvent[]>();
    for (const h of holidays) {
      const list = map.get(h.date) ?? [];
      list.push(h);
      map.set(h.date, list);
    }
    return map;
  }, [holidays]);

  // Which days a run of leave covers. The bars are laid out per week from the spans themselves, so
  // this exists only for `renderDay` — through the shared expander, like every other
  // walk over a span in this module.
  const timeOffDates = useMemo(() => {
    const dates = new Set<string>();
    for (const t of timeOff) for (const iso of expandSpanToDays(t.startDate, t.endDate)) dates.add(iso);
    return dates;
  }, [timeOff]);

  // As many week-rows as the visible month touches — four to six. The grid used to be a fixed six,
  // so a month that fits in five drew a whole extra week of the next one.
  const weekCount = weeksInMonth(cursor.year, cursor.month);

  const weeks = useMemo<DayCell[][]>(() => {
    const { year, month } = cursor;
    const firstOffset = weekdayOffset(new Date(year, month, 1).getDay());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = weeksInMonth(year, month);

    const cells: DayCell[] = Array.from({ length: rows * 7 }).map((_, i) => {
      const dayNum = i - firstOffset + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const date = new Date(year, month, dayNum);
      const iso = toISO(date.getFullYear(), date.getMonth(), date.getDate());
      const isWeekend = isNonWorkingDay(date);
      const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());
      return { iso, dayNumber: date.getDate(), inMonth, isWeekend, isToday, dayHolidays: holidaysByDay.get(iso) ?? [] };
    });

    return Array.from({ length: rows }).map((_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [cursor, holidaysByDay, today, isNonWorkingDay]);

  const dayInfo = useMemo<CalendarDayInfo[][]>(
    () =>
      weeks.map((week) =>
        week.map((cell) => ({
          iso: cell.iso,
          inMonth: cell.inMonth,
          isWeekend: cell.isWeekend,
          isToday: cell.isToday,
          isHoliday: cell.dayHolidays.length > 0,
          isTimeOff: timeOffDates.has(cell.iso),
        })),
      ),
    [weeks, timeOffDates],
  );

  const goPrev = () =>
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }));
  const goNext = () =>
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }));
  const goToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });
  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  const cellMinH = compact ? "min-h-[72px]" : "min-h-[104px]";
  const monthClass = compact ? "text-body font-semibold text-primary" : "text-section-title text-primary";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar — month name + navigation grouped on the left; optional action on the right.
          Wraps: the action slot holds up to four buttons and below ~1100px the last one used to
          run off the right edge instead of dropping to a second row. */}
      {toolbar === "split" ? (
        <div className="flex-none pb-4">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="secondary" size="icon-sm" aria-label="Previous month" onClick={goPrev}>
              <Icon icon={ArrowLeft01Icon} size="sm" />
            </Button>
            <h2 className={monthClass}>
              {MONTHS[cursor.month]} {cursor.year}
            </h2>
            <Button type="button" variant="secondary" size="icon-sm" aria-label="Next month" onClick={goNext}>
              <Icon icon={ArrowRight01Icon} size="sm" />
            </Button>
          </div>
          {/* Its own row rather than a third thing in the stepper, which would push the month off
              centre. Today appears only away from the current month, where there is somewhere to go. */}
          {headerAction || !isCurrentMonth ? (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {!isCurrentMonth && (
                <Button type="button" variant="secondary" size="sm" onClick={goToday}>
                  Today
                </Button>
              )}
              {headerAction}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-4">
          <div className="flex items-center gap-3">
            <h2 className={monthClass}>
              {MONTHS[cursor.month]} {cursor.year}
            </h2>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={goToday}>
                Today
              </Button>
              <Button type="button" variant="secondary" size="icon-sm" aria-label="Previous month" onClick={goPrev}>
                <Icon icon={ArrowLeft01Icon} size="sm" />
              </Button>
              <Button type="button" variant="secondary" size="icon-sm" aria-label="Next month" onClick={goNext}>
                <Icon icon={ArrowRight01Icon} size="sm" />
              </Button>
            </div>
          </div>
          {headerAction ? (
            <div className="flex flex-wrap items-center gap-2">{headerAction}</div>
          ) : null}
        </div>
      )}

      {/* Grid — light dividers, no outer border. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Weekday header */}
        <div className={`${gridClass} border-b border-divider`}>
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="border-r border-divider px-2 py-2 text-center text-hint font-medium text-tertiary last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: weekCount }).map((_, w) => (
            <div key={`cal-skel-${w}`} className={gridClass}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`cal-skel-${w}-${i}`}
                  className={`${cellMinH} border-b border-r border-divider p-2 last:border-r-0`}
                >
                  <Skeleton className="h-4 w-5" />
                </div>
              ))}
            </div>
          ))
        ) : (
          weeks.map((week, wIdx) => {
            const segments = buildWeekSegments(week, timeOff);
            const weekInfo = dayInfo[wIdx];
            return (
              <div key={`week-${wIdx}`} className={`relative ${gridClass}`}>
                {week.map((cell, dIdx) => {
                  const holiday = cell.dayHolidays[0];
                  const holidayTitle = cell.dayHolidays
                    .map((h) => (h.calendarName ? `${h.name} · ${h.calendarName}` : h.name))
                    .join("\n");
                  const inSelection = Boolean(selRange && cell.iso >= selRange.start && cell.iso <= selRange.end);
                  const picked = Boolean(
                    selectedRange && cell.iso >= selectedRange.start && cell.iso <= selectedRange.end,
                  );
                  return (
                    <div
                      key={cell.iso}
                      onPointerDown={selectable ? (e) => { e.preventDefault(); setDrag({ anchor: cell.iso, hover: cell.iso }); } : undefined}
                      onPointerEnter={selectable ? () => setDrag((d) => (d ? { ...d, hover: cell.iso } : d)) : undefined}
                      className={[
                        cellMinH,
                        // Not `last:border-r-0`: the time-off overlay below is the row's last child,
                        // so Sunday never matched it and kept an outer border.
                        "border-b border-divider",
                        dIdx < week.length - 1 ? "border-r" : "",
                        selectable ? "cursor-pointer select-none" : "",
                        inSelection || picked
                          ? "bg-accent-subtle"
                          : !cell.inMonth ? "bg-subtle/30" : cell.isToday ? "bg-subtle" : cell.isWeekend ? "bg-subtle/40" : "",
                        // Only the ends are ringed, so a run reads as one run and not as five boxes.
                        picked && (cell.iso === selectedRange?.start || cell.iso === selectedRange?.end)
                          ? "ring-2 ring-inset ring-accent-ring"
                          : "",
                      ].join(" ")}
                    >
                      <div className="relative z-10 flex items-center justify-between px-1.5 pt-1">
                        <span
                          className={[
                            "inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1 text-hint",
                            cell.isToday
                              ? "bg-accent font-semibold text-on-accent"
                              : cell.inMonth
                                ? "text-primary"
                                : "text-disabled",
                          ].join(" ")}
                        >
                          {cell.dayNumber}
                        </span>
                        {holiday ? (
                          <span
                            title={holidayTitle}
                            className="h-1.5 w-1.5 rounded-pill bg-status-declined-fill"
                            aria-label={holiday.name}
                          />
                        ) : null}
                      </div>

                      {renderDay ? (
                        <div className="relative z-10 px-1.5 pb-1 pt-0.5">{renderDay(weekInfo[dIdx])}</div>
                      ) : null}
                    </div>
                  );
                })}

                {/* Continuous time-off bars for this week, laid over the day cells. An equal gap is
                    left on every OUTER edge — top/bottom (drawn from the cell's top border, not from
                    the day number, which sits above via z-10) and the sides of the terminal days
                    (a true start/end gets a side margin; a run continuing across a week edge stays
                    flush so it reads as one line). Multiple overlapping runs split the height. */}
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-1.5 top-1.5 auto-rows-fr gap-y-1 ${gridClass}`}
                >
                  {segments.map((seg) => (
                    <div
                      key={`${seg.id}-${wIdx}`}
                      title={seg.label}
                      style={{
                        gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                        gridRow: seg.lane + 1,
                        ...timeOffStyle(seg.tone, seg.color),
                      }}
                      className={[
                        "flex items-center truncate border-[1.5px] px-1.5 text-hint font-medium",
                        seg.continuesLeft ? "rounded-none border-l-0" : "ml-1.5 rounded-l-control",
                        seg.continuesRight ? "rounded-none border-r-0" : "mr-1.5 rounded-r-control",
                      ].join(" ")}
                    >
                      {seg.continuesLeft ? "" : seg.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {footer ? <div className="flex-none pt-3">{footer(dayInfo.flat())}</div> : null}

      {/* Legend */}
      {!compact && (
        <div className="flex flex-none flex-wrap items-center gap-4 pt-4 text-hint text-tertiary">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-pill bg-status-declined-fill" />
            Public holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-tag border-[1.5px]" style={timeOffStyle("approved")} />
            Time off — approved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-tag border-[1.5px]" style={timeOffStyle("pending")} />
            Time off — pending
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Icon icon={Calendar03Icon} size="sm" />
            {holidays.length} holidays · {timeOff.length} time-off entries
          </span>
        </div>
      )}
    </div>
  );
};
