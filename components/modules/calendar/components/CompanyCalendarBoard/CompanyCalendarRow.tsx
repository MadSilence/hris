"use client";

import { FC, useMemo } from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import type { CompanyCalendarMark, CompanyCalendarUser } from "@/models/calendar";

export const NAME_COL = 200;

export const boardGridTemplate = (dayCount: number): string =>
  `${NAME_COL}px repeat(${dayCount}, minmax(0, 1fr))`;

/** danger-100 — a variable because the half-day fill is a gradient stop, not a utility class. */
const HOLIDAY_FILL = "var(--danger-100)";

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
  // A substituted holiday is drawn exactly like any other and says nothing about where it moved from:
  // decided, with the nominal date dropping out of the product (`nominalDate` stays on the DTO, unused).
  return m.calendarName ? `${parts.join(" ")} · ${m.calendarName}` : parts.join(" ");
};

/** Marks grouped by the row they belong to. */
export const useMarksByUser = (marks: CompanyCalendarMark[]) =>
  useMemo(() => {
    const map = new Map<string, CompanyCalendarMark[]>();
    for (const m of marks) {
      const list = map.get(m.userId) ?? [];
      list.push(m);
      map.set(m.userId, list);
    }
    return map;
  }, [marks]);

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
};

export const CompanyCalendarRow: FC<RowProps> = ({
  user: u,
  marks,
  days,
  dayISOs,
  todayISO,
  isNonWorkingDay,
  density,
  gridTemplateColumns,
}) => {
  const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
  const segments = toSegments(marks, dayISOs);

  return (
    <div className="relative grid w-full text-sm" style={{ gridTemplateColumns }}>
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
                "pointer-events-auto flex items-center overflow-hidden border border-danger-200 text-[11px] leading-none text-danger-800",
                seg.continuesLeft ? "rounded-l-none border-l-0" : "ml-1 rounded-l-md",
                seg.continuesRight ? "rounded-r-none border-r-0" : "mr-1 rounded-r-md",
              ].join(" ")}
            >
              {/* The name only where it fits. At month density a day column is a
                  fraction of the row, so the tooltip carries it instead. */}
              {density === "week" && !seg.continuesLeft ? (
                <span className="truncate px-1.5">
                  {seg.mark.name}
                  {/* The bar is painted half; the words say so where there is room for
                      words, so the fill is not the only carrier of the fact. */}
                  {seg.mark.dayPart === "HALF_DAY" ? " · Half Day" : null}
                </span>
              ) : null}
            </div>
          ))}
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
