"use client";

import { CSSProperties, FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import type { CompanyCalendarAbsence, CompanyCalendarMark, CompanyCalendarUser } from "@/models/calendar";

export const NAME_COL = 200;

export const boardGridTemplate = (dayCount: number): string =>
  `${NAME_COL}px repeat(${dayCount}, minmax(0, 1fr))`;

/** danger-100 — a variable because the half-day fill is a gradient stop, not a utility class. */
const HOLIDAY_FILL = "var(--danger-100)";

/**
 * One bar on a row: a public holiday or a person's leave, clipped to the visible days and turned into a
 * column span and a lane.
 *
 * A holiday bar is **one holiday**, not a run of adjacent days: two different holidays that happen to
 * touch — Christmas Eve on the 24th and a Christmas Break spanning the 25th–26th — stay two bars, because
 * merging them would have to throw one of the names away. Leave is one bar per request.
 */
export type CompanyCalendarBar =
  | { kind: "holiday"; key: string; mark: CompanyCalendarMark; startDate: string; endDate: string }
  | { kind: "leave"; key: string; absence: CompanyCalendarAbsence; startDate: string; endDate: string };

type Segment = {
  bar: CompanyCalendarBar;
  startCol: number;
  endCol: number;
  lane: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

/** Height of one lane, and what the row keeps around its lanes. */
const LANE_PX = 22;
const ROW_PAD_PX = 12;
const MIN_ROW_PX = 44;

/**
 * Clips the bars to the window and packs them into lanes: each bar takes the first lane whose last bar
 * ended before it starts. Measured from the data, never from the DOM — a sticky name column over rows of
 * varying height is where this board's layout broke before.
 */
export const toSegments = (bars: CompanyCalendarBar[], dayISOs: string[]): Segment[] => {
  if (dayISOs.length === 0) return [];
  const first = dayISOs[0];
  const last = dayISOs[dayISOs.length - 1];

  const clipped = bars
    .filter((b) => b.startDate <= last && b.endDate >= first)
    .map((b) => {
      const startISO = b.startDate < first ? first : b.startDate;
      const endISO = b.endDate > last ? last : b.endDate;
      return {
        bar: b,
        startCol: dayISOs.indexOf(startISO),
        endCol: dayISOs.indexOf(endISO),
        lane: 0,
        continuesLeft: b.startDate < first,
        continuesRight: b.endDate > last,
      };
    })
    .filter((s) => s.startCol !== -1 && s.endCol !== -1)
    // Holidays first on a tie, so a row's holiday keeps its familiar top lane.
    .sort((a, b) => a.startCol - b.startCol || (a.bar.kind === b.bar.kind ? 0 : a.bar.kind === "holiday" ? -1 : 1));

  const laneEnds: number[] = [];
  for (const seg of clipped) {
    let lane = laneEnds.findIndex((end) => end < seg.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(seg.endCol);
    } else {
      laneEnds[lane] = seg.endCol;
    }
    seg.lane = lane;
  }
  return clipped;
};

/** One lane keeps the old row height, so most rows do not move when leave arrives. */
export const rowHeight = (segments: Segment[]): number => {
  const lanes = segments.reduce((max, s) => Math.max(max, s.lane + 1), 0);
  return Math.max(MIN_ROW_PX, lanes * LANE_PX + ROW_PAD_PX);
};

const holidayTitle = (m: CompanyCalendarMark): string => {
  const parts = [m.name];
  // The board draws half a day and leave counting charges a whole one. Both are deliberate — exact
  // half-day arithmetic arrives with hourly absence, which does not exist — but the two screens were
  // disagreeing in silence, and the person reading them is the one who loses the day.
  if (m.dayPart === "HALF_DAY") parts.push("(half day — leave still counts it as a whole day)");
  // A substituted holiday is drawn exactly like any other and says nothing about where it moved from:
  // decided, with the nominal date dropping out of the product (`nominalDate` stays on the DTO, unused).
  return m.calendarName ? `${parts.join(" ")} · ${m.calendarName}` : parts.join(" ");
};

const leaveLabel = (a: CompanyCalendarAbsence): string => a.leaveTypeName ?? "Time off";

/** The tooltip is the explanation — there is no legend (`COMPANY_CALENDAR.md` § 7). */
export const leaveTitle = (a: CompanyCalendarAbsence): string => {
  const dates = a.startDate === a.endDate ? a.startDate : `${a.startDate} – ${a.endDate}`;
  const parts = [leaveLabel(a), dates];
  if (a.status === "PENDING") parts.push(a.awaitingYou ? "Pending your approval" : "Pending approval");
  if (a.status === "CANCELLATION_PENDING") {
    parts.push(a.awaitingYou ? "Cancellation waiting for your approval" : "Cancellation requested");
  }
  return parts.join(" · ");
};

/**
 * A leave bar's fill: the type's colour, faint, only when the type was sent; otherwise neutral. A masked
 * bar tinted with its type's colour would still name the type to anyone who has learnt the colour.
 * Undecided leave is hatched over the same fill, with a dashed edge so the difference is not colour alone.
 */
export const leaveStyle = (a: CompanyCalendarAbsence): CSSProperties => {
  const hex = a.leaveTypeColor && /^#[0-9a-fA-F]{6}$/.test(a.leaveTypeColor) ? a.leaveTypeColor : null;
  const undecided = a.status !== "APPROVED";
  return {
    backgroundColor: hex ? `${hex}33` : "var(--brown-100)",
    borderColor: hex ?? "var(--brown-300)",
    ...(undecided
      ? {
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 4px, rgba(255,255,255,0.75) 4px 8px)",
          borderStyle: "dashed",
        }
      : {}),
  };
};

const byUser = <T extends { userId: string }>(items: T[]) => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.userId) ?? [];
    list.push(item);
    map.set(item.userId, list);
  }
  return map;
};

/** Marks grouped by the row they belong to. */
export const useMarksByUser = (marks: CompanyCalendarMark[]) => useMemo(() => byUser(marks), [marks]);

/** Leave grouped by the row it belongs to. */
export const useAbsencesByUser = (absences: CompanyCalendarAbsence[]) =>
  useMemo(() => byUser(absences), [absences]);

export type CompanyCalendarRowGeometry = {
  days: Date[];
  dayISOs: string[];
  todayISO: string;
  isNonWorkingDay: (d: Date) => boolean;
  density: "month" | "week";
  gridTemplateColumns: string;
};

type RowProps = CompanyCalendarRowGeometry & {
  user: CompanyCalendarUser;
  marks: CompanyCalendarMark[];
  absences?: CompanyCalendarAbsence[];
  /**
   * Set when the reader may ask for leave on this row — their own, or someone's they may file for. A
   * click or a drag across days opens the request with those dates; the server decides whether it may
   * be filed.
   */
  onSelectRange?: (startISO: string, endISO: string) => void;
};

const NO_ABSENCES: CompanyCalendarAbsence[] = [];

export const CompanyCalendarRow: FC<RowProps> = ({
  user: u,
  marks,
  absences = NO_ABSENCES,
  days,
  dayISOs,
  todayISO,
  isNonWorkingDay,
  density,
  gridTemplateColumns,
  onSelectRange,
}) => {
  // A drag across the row's days: where it started and where the pointer is now. Released anywhere —
  // the pointer may leave the row while dragging — it opens the request for the days covered.
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);
  useEffect(() => {
    if (!drag || !onSelectRange) return;
    const finish = () => {
      const a = Math.min(drag.from, drag.to);
      const b = Math.max(drag.from, drag.to);
      setDrag(null);
      onSelectRange(dayISOs[a], dayISOs[b]);
    };
    window.addEventListener("mouseup", finish);
    return () => window.removeEventListener("mouseup", finish);
  }, [drag, onSelectRange, dayISOs]);
  const selected = (i: number) =>
    drag !== null && i >= Math.min(drag.from, drag.to) && i <= Math.max(drag.from, drag.to);

  const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
  const segments = useMemo(
    () =>
      toSegments(
        [
          ...marks.map(
            (m): CompanyCalendarBar => ({
              kind: "holiday",
              key: `h-${m.id}-${m.calendarId}-${m.startDate}`,
              mark: m,
              startDate: m.startDate,
              endDate: m.endDate,
            }),
          ),
          ...absences.map(
            (a, i): CompanyCalendarBar => ({
              kind: "leave",
              key: `l-${a.requestId ?? i}-${a.startDate}`,
              absence: a,
              startDate: a.startDate,
              endDate: a.endDate,
            }),
          ),
        ],
        dayISOs,
      ),
    [marks, absences, dayISOs],
  );
  const height = rowHeight(segments);

  return (
    <div className="relative grid w-full text-sm" style={{ gridTemplateColumns }}>
      <div
        className="sticky left-0 z-10 border-b border-r border-brown-200 bg-white px-3 py-2"
        style={{ minHeight: height }}
      >
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
            style={{ minHeight: height }}
            data-day={iso}
            onMouseDown={
              onSelectRange
                ? (e) => {
                    e.preventDefault();
                    setDrag({ from: i, to: i });
                  }
                : undefined
            }
            onMouseEnter={onSelectRange && drag ? () => setDrag({ from: drag.from, to: i }) : undefined}
            className={[
              "border-b border-r border-brown-100",
              selected(i) ? "bg-brown-100" : today ? "bg-brown-50" : weekend ? "bg-brown-50/50" : "",
              onSelectRange ? "cursor-cell" : "",
            ].join(" ")}
          />
        );
      })}

      {/* Bars, laid over the day cells in a grid with the same columns, one grid row per lane. The
          name column is skipped by starting every span at column 2. */}
      {segments.length > 0 ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-1.5 grid gap-y-0.5"
          style={{ gridTemplateColumns, gridAutoRows: `${LANE_PX - 2}px` }}
        >
          {segments.map((seg) => {
            const edges = [
              seg.continuesLeft ? "rounded-l-none border-l-0" : "ml-1 rounded-l-md",
              seg.continuesRight ? "rounded-r-none border-r-0" : "mr-1 rounded-r-md",
            ].join(" ");
            const placement = { gridColumn: `${seg.startCol + 2} / ${seg.endCol + 3}`, gridRow: seg.lane + 1 };
            // The name only where it fits. At month density a day column is a fraction of the row, so
            // the tooltip carries it instead.
            const showLabel = density === "week" && !seg.continuesLeft;

            if (seg.bar.kind === "holiday") {
              const mark = seg.bar.mark;
              return (
                <div
                  key={seg.bar.key}
                  title={holidayTitle(mark)}
                  style={{
                    ...placement,
                    // A half day is painted half — the fill stops halfway up the bar, so
                    // the day still reads as a day off without claiming the whole of it.
                    ...(mark.dayPart === "HALF_DAY"
                      ? { backgroundImage: `linear-gradient(to top, ${HOLIDAY_FILL} 50%, transparent 50%)` }
                      : { backgroundColor: HOLIDAY_FILL }),
                  }}
                  className={`pointer-events-auto flex items-center overflow-hidden border border-danger-200 text-[11px] leading-none text-danger-800 ${edges}`}
                >
                  {showLabel ? (
                    <span className="truncate px-1.5">
                      {mark.name}
                      {/* The bar is painted half; the words say so where there is room for
                          words, so the fill is not the only carrier of the fact. */}
                      {mark.dayPart === "HALF_DAY" ? " · Half Day" : null}
                    </span>
                  ) : null}
                </div>
              );
            }

            const absence = seg.bar.absence;
            const className = [
              "pointer-events-auto flex items-center overflow-hidden border text-[11px] leading-none text-brown-800",
              absence.requestId ? "cursor-pointer hover:brightness-95" : "",
              edges,
            ].join(" ");
            const content = (
              <>
                {absence.awaitingYou ? (
                  <span
                    aria-label="Waiting for your approval"
                    className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500"
                  />
                ) : null}
                {showLabel ? <span className="truncate px-1.5">{leaveLabel(absence)}</span> : null}
              </>
            );
            const style = { ...placement, ...leaveStyle(absence) };
            // A bar is a link only for a reader the server gave the request id to.
            return absence.requestId ? (
              <Link
                key={seg.bar.key}
                href={`/time-off/requests/${absence.requestId}`}
                title={leaveTitle(absence)}
                data-status={absence.status}
                style={style}
                className={className}
              >
                {content}
              </Link>
            ) : (
              <div
                key={seg.bar.key}
                title={leaveTitle(absence)}
                data-status={absence.status}
                style={style}
                className={className}
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/** A placeholder row, the same height and columns as a real one. */
export const CompanyCalendarSkeletonRow: FC<{ dayISOs: string[]; gridTemplateColumns: string }> = ({
  dayISOs,
  gridTemplateColumns,
}) => (
  <div className="grid w-full text-sm" style={{ gridTemplateColumns }}>
    <div className="sticky left-0 z-10 border-b border-r border-brown-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
    {dayISOs.map((iso) => (
      <div key={iso} className="min-h-[44px] border-b border-r border-brown-100" />
    ))}
  </div>
);
