"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Skeleton } from "@/components/desact/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { cn } from "@/lib/cn";
import type { CompanyCalendarAbsence, CompanyCalendarMark, CompanyCalendarUser } from "@/models/calendar";
import { toISO } from "@/components/modules/calendar/lib/dateRange";
import {
  NAME_COL,
  ROW_H,
  indexOfISO,
  pillTop,
  rowHeightFor,
} from "@/components/modules/calendar/lib/boardGeometry";
import { alsoAway, pillSuffix, requestSpan } from "@/components/modules/calendar/lib/leaveText";
import { LeavePill, usePillSuffixText } from "@/components/modules/calendar/components/LeavePill";
import { LeaveCard } from "@/components/modules/calendar/components/LeaveCard";
import { displayName, useBoard } from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";

/**
 * One leave on a row, cut to the loaded days and given a lane. Two leaves of one person that overlap — a request and
 * its cancellation, two policies on one day — take two lanes, and the row grows; one lane keeps the row at 52.
 */
export type LeaveSegment = {
  absence: CompanyCalendarAbsence;
  key: string;
  startCol: number;
  endCol: number;
  lane: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

/**
 * Cuts the leave to the loaded days and packs it into lanes: each pill takes the first lane whose last pill ended
 * before it starts. Measured from the data, never from the DOM — a sticky name column over rows of varying height is
 * where this board's layout broke before.
 */
export const toLaneSegments = (
  absences: readonly CompanyCalendarAbsence[],
  rangeStart: Date,
  dayCount: number,
): { segments: LeaveSegment[]; lanes: number } => {
  const firstISO = toISO(rangeStart);
  const segments = absences
    .map((a, i): LeaveSegment | null => {
      const start = indexOfISO(rangeStart, a.startDate);
      const end = indexOfISO(rangeStart, a.endDate);
      if (end < 0 || start > dayCount - 1) return null;
      const span = requestSpan(a);
      return {
        absence: a,
        key: `${a.requestId ?? i}-${a.startDate}`,
        startCol: Math.max(0, start),
        endCol: Math.min(dayCount - 1, end),
        lane: 0,
        continuesLeft: span.start < firstISO,
        continuesRight: end > dayCount - 1,
      };
    })
    .filter((s): s is LeaveSegment => s !== null)
    .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

  const laneEnds: number[] = [];
  for (const seg of segments) {
    let lane = laneEnds.findIndex((end) => end < seg.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(seg.endCol);
    } else {
      laneEnds[lane] = seg.endCol;
    }
    seg.lane = lane;
  }
  return { segments, lanes: Math.max(1, laneEnds.length) };
};

type RowProps = {
  user: CompanyCalendarUser;
  marks: CompanyCalendarMark[];
  absences?: CompanyCalendarAbsence[];
  /**
   * Set when the reader may ask for leave on this row — their own, or someone's they may file for. A click or a drag
   * across days opens the request with those dates; the server decides whether it may be filed.
   */
  onSelectRange?: (startISO: string, endISO: string) => void;
};

const NO_ABSENCES: CompanyCalendarAbsence[] = [];

/**
 * A person row (N01): avatar 28 and the name 14/20 500 in the people column, then the days. Every day is its own cell
 * — the dividers, the weekends, the month starts and the today line are the board's, drawn once behind all rows —
 * and on the row only what is the person's: their public holidays as a light tint of the company colour (accent 9 %,
 * no flag; the week view names it in the cell), and their leave as pills, centred, over everything but the people
 * column. Rows never shrink.
 */
export const CompanyCalendarRow: FC<RowProps> = ({ user: u, marks, absences = NO_ABSENCES, onSelectRange }) => {
  const { geometry, setPicked } = useBoard();
  const { rangeStart, dayCount, dayW, scale, columnHolidays } = geometry;
  const suffixText = usePillSuffixText();
  const dayArea = useRef<HTMLDivElement | null>(null);

  const { segments, lanes } = useMemo(
    () => toLaneSegments(absences, rangeStart, dayCount),
    [absences, rangeStart, dayCount],
  );
  const height = rowHeightFor(segments.length === 0 ? 1 : lanes);

  // The person's public holidays, cut to the loaded days. A day that is a holiday for everyone shown is drawn by
  // the board across the whole column instead, so it is not tinted twice.
  const holidays = useMemo(
    () =>
      marks
        .map((m) => ({
          mark: m,
          startCol: Math.max(0, indexOfISO(rangeStart, m.startDate)),
          endCol: Math.min(dayCount - 1, indexOfISO(rangeStart, m.endDate)),
        }))
        .filter((h) => h.endCol >= h.startCol && h.endCol >= 0 && h.startCol <= dayCount - 1),
    [marks, rangeStart, dayCount],
  );

  // A drag across the row's days: where it started and where the pointer is now. Released anywhere — the pointer may
  // leave the row while dragging — it opens the request for the days covered.
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);
  useEffect(() => {
    setPicked(drag ? { from: Math.min(drag.from, drag.to), to: Math.max(drag.from, drag.to) } : null);
  }, [drag, setPicked]);
  useEffect(() => {
    if (!drag || !onSelectRange) return;
    const move = (e: MouseEvent) => {
      const col = columnAt(e.clientX);
      if (col !== null) setDrag((d) => (d && d.to !== col ? { from: d.from, to: col } : d));
    };
    const finish = () => {
      const a = Math.min(drag.from, drag.to);
      const b = Math.max(drag.from, drag.to);
      setDrag(null);
      onSelectRange(dayISO(a), dayISO(b));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", finish);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", finish);
    };
  });

  const dayISO = (col: number) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + col);
    return toISO(d);
  };
  const columnAt = (clientX: number): number | null => {
    const area = dayArea.current;
    if (!area) return null;
    const col = Math.floor((clientX - area.getBoundingClientRect().left) / dayW);
    return Math.max(0, Math.min(dayCount - 1, col));
  };

  const name = displayName(u);

  return (
    <div
      data-test="calendar-row"
      className="group/row relative flex border-b border-divider hover:bg-row-hover/60"
      style={{ height, width: NAME_COL + dayCount * dayW }}
    >
      <div className="sticky left-0 z-20 flex shrink-0 items-center gap-2.5 bg-card pr-3 pl-4 group-hover/row:bg-row-hover" style={{ width: NAME_COL }}>
        <Avatar className="size-7">
          {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt="" /> : null}
          <AvatarFallback name={name} />
        </Avatar>
        {/* The name 14/20 500 over the job 12/16 tertiary (B5); both cut with … and whole in the tooltip (N19). */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium text-primary">{name}</span>
              {u.jobName ? <span className="truncate text-hint text-tertiary">{u.jobName}</span> : null}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {name}
            {u.jobName ? <span className="block">{u.jobName}</span> : null}
          </TooltipContent>
        </Tooltip>
      </div>

      <div
        ref={dayArea}
        data-test="calendar-row-days"
        className={cn("relative flex-1", onSelectRange && "cursor-cell")}
        onMouseDown={
          onSelectRange
            ? (e) => {
                if (e.button !== 0) return;
                const col = columnAt(e.clientX);
                if (col === null) return;
                e.preventDefault();
                setDrag({ from: col, to: col });
              }
            : undefined
        }
      >
        {holidays.map(({ mark, startCol, endCol }) => {
          const everywhere = Array.from({ length: endCol - startCol + 1 }, (_, i) => startCol + i).every((c) =>
            columnHolidays.has(c),
          );
          return (
            <div
              key={`${mark.id}-${mark.calendarId}-${mark.startDate}`}
              data-holiday={mark.name}
              className="absolute inset-y-0 flex items-center px-2"
              style={{
                left: startCol * dayW,
                width: (endCol - startCol + 1) * dayW,
                // A half day is tinted half — the day still reads as a day off without claiming the whole of it.
                ...(everywhere
                  ? null
                  : mark.dayPart === "HALF_DAY"
                    ? { backgroundImage: "linear-gradient(to top, var(--holiday-tint) 50%, transparent 50%)" }
                    : { backgroundColor: "var(--holiday-tint)" }),
              }}
            >
              {scale === "week" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="min-w-0 truncate text-hint text-accent-text">{mark.name}</span>
                  </TooltipTrigger>
                  <TooltipContent>{mark.name}</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          );
        })}

        {/* The days being picked: one soft band over the cells, not a tint per day (the owner, 2026-11-05). */}
        {drag !== null ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 rounded-control bg-accent-subtle"
            style={{
              left: Math.min(drag.from, drag.to) * dayW + 4,
              width: (Math.abs(drag.to - drag.from) + 1) * dayW - 8,
            }}
          />
        ) : null}

        {segments.map((seg) => {
          const width = (seg.endCol - seg.startCol + 1) * dayW - (seg.continuesLeft ? 0 : 2) - (seg.continuesRight ? 0 : 2);
          return (
            <LeavePillWithCard
              key={seg.key}
              segment={seg}
              suffix={suffixText(pillSuffix(seg.absence, scale, geometry.isNonWorkingDay))}
              left={seg.startCol * dayW + (seg.continuesLeft ? 0 : 2)}
              top={pillTop(height, lanes, seg.lane)}
              width={width}
            />
          );
        })}
      </div>
    </div>
  );
};

/** A pill and its card (N04, N05): the card pops up centred on the pill, 6 px from it, kept inside the board. */
const LeavePillWithCard: FC<{ segment: LeaveSegment; suffix: string | null; left: number; top: number; width: number }> = ({
  segment,
  suffix,
  left,
  top,
  width,
}) => {
  const { geometry, registry, decisions } = useBoard();
  const [open, setOpen] = useState(false);
  const a = segment.absence;
  const decide = decisions.canDecide(a);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <LeavePill
          absence={a}
          suffix={suffix}
          continuesLeft={segment.continuesLeft}
          continuesRight={segment.continuesRight}
          width={width}
          className="absolute z-10"
          style={{ left, top, width }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" sideOffset={6} collisionPadding={12} className="w-[300px] rounded-card p-4">
        {open ? (
          <LeaveCard
            absence={a}
            isNonWorkingDay={geometry.isNonWorkingDay}
            alsoAway={a.status === "APPROVED" ? null : alsoAway(a, registry.absences(), (id) => registry.nameOf(id))}
            openFull={decisions.openFull(a)}
            onApprove={
              decide
                ? () => {
                    setOpen(false);
                    decisions.approve(a);
                  }
                : undefined
            }
            onDecline={
              decide
                ? () => {
                    setOpen(false);
                    decisions.decline(a, registry.nameOf(a.userId));
                  }
                : undefined
            }
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

/** A placeholder row while the people load (N16): avatar and two bars, and a skeleton pill or two. */
export const CompanyCalendarSkeletonRow: FC<{ index: number }> = ({ index }) => {
  const { geometry } = useBoard();
  const { dayW, dayCount, todayIndex } = geometry;
  // Deterministic placements around today, so the shimmer does not jump between renders.
  const pills = [
    { at: (index * 5) % 11, len: 2 + (index % 4) },
    ...(index % 3 === 0 ? [{ at: 14 + (index % 6), len: 3 }] : []),
  ];
  const first = Math.max(0, todayIndex - 3);
  return (
    <div className="relative flex border-b border-divider" style={{ height: ROW_H, width: NAME_COL + dayCount * dayW }}>
      <div className="sticky left-0 z-20 flex shrink-0 items-center gap-2.5 bg-card pr-3 pl-4" style={{ width: NAME_COL }}>
        <Skeleton className="size-7 rounded-pill" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <div className="relative flex-1">
        {pills.map((p, i) => (
          <Skeleton
            key={i}
            className="absolute h-7 rounded-pill"
            style={{ left: (first + p.at) * dayW + 2, top: (ROW_H - 28) / 2, width: p.len * dayW - 4 }}
          />
        ))}
      </div>
    </div>
  );
};
