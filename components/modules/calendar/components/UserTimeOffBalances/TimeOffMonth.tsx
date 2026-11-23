"use client";

import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { cn } from "@/lib/cn";
import { dateToISO, isoToDate, useShortDates, useWeekStartsOn } from "@/lib/date";
import { leaveClasses } from "@/lib/theme/leave";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { MONTH_KEYS, WEEKDAY_KEYS } from "@/components/modules/calendar/lib/dateRange";
import { backOn, inRange, monthWeeks, type DayRange, type MonthCell } from "@/components/modules/timeOff/lib/leaveDays";
import { lengthOf, requestUnitOf } from "@/components/modules/timeOff/lib/leaveWords";
import { LeaveCard } from "./LeaveCard";

/** Leave the calendar draws: approved as a fill, waiting as a dashed edge. */
const SHOWN = new Set<string>([TimeOffRequestStatus.Approved, TimeOffRequestStatus.Pending, TimeOffRequestStatus.CancellationPending]);
/** Two lanes of pills under the day's number (Q05); a third request turns the second lane into "+N more" (Q05b). */
const LANES = 2;
const PILL_TOP = 46;
const LANE_STEP = 30;

type Segment = {
  key: string;
  request: TimeOffRequest;
  startCol: number;
  endCol: number;
  /** Runs on from the previous week row: a square start. */
  fromLeft: boolean;
  /** Runs on into the next week row: a square end. */
  toRight: boolean;
  /** Runs past the month's grid: faded out at that edge (Q06). */
  fadeLeft: boolean;
  fadeRight: boolean;
  lane: number;
};

/** One week row's pills: clipped to the row, packed into lanes, the second lane cut around days with more than two. */
export const layoutWeek = (
  week: MonthCell[],
  requests: TimeOffRequest[],
  first: boolean,
  last: boolean,
): { segments: Segment[]; more: { col: number; count: number }[] } => {
  const from = week[0].iso;
  const to = week[6].iso;
  const colOf = (iso: string) => week.findIndex((c) => c.iso === iso);
  const raw = requests
    .filter((r) => r.startDate <= to && r.endDate >= from)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || b.endDate.localeCompare(a.endDate))
    .map((r) => ({
      request: r,
      startCol: r.startDate < from ? 0 : colOf(r.startDate),
      endCol: r.endDate > to ? 6 : colOf(r.endDate),
      fromLeft: r.startDate < from,
      toRight: r.endDate > to,
    }));

  const laneEnds: number[] = [];
  const laid = raw.map((s) => {
    let lane = laneEnds.findIndex((end) => end < s.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(s.endCol);
    } else laneEnds[lane] = s.endCol;
    return { ...s, lane };
  });

  const perDay = Array.from({ length: 7 }, (_, col) => laid.filter((s) => s.startCol <= col && s.endCol >= col).length);
  const overflow = perDay.map((n) => n > LANES);

  const segments: Segment[] = [];
  for (const s of laid) {
    if (s.lane >= LANES) continue;
    // The first lane stays whole; the second gives way to "+N more" on a crowded day, in pieces around it.
    let start = -1;
    for (let col = s.startCol; col <= s.endCol + 1; col++) {
      const free = col <= s.endCol && !(s.lane === LANES - 1 && overflow[col]);
      if (free && start === -1) start = col;
      if (!free && start !== -1) {
        const end = col - 1;
        segments.push({
          key: `${s.request.id}:${start}`,
          request: s.request,
          startCol: start,
          endCol: end,
          fromLeft: start === s.startCol && s.fromLeft,
          toRight: end === s.endCol && s.toRight,
          fadeLeft: first && start === s.startCol && s.fromLeft,
          fadeRight: last && end === s.endCol && s.toRight,
          lane: s.lane,
        });
        start = -1;
      }
    }
  }
  const more = perDay.flatMap((count, col) => (overflow[col] ? [{ col, count: count - 1 }] : []));
  return { segments, more };
};

type Props = {
  requests: TimeOffRequest[];
  policyMap: Map<string, TimeOffPolicy>;
  /** The person's office holidays by day, with their names. */
  holidays: Map<string, string[]>;
  isNonWorking: (d: Date) => boolean;
  /** Ids of the requests waiting on the reader. */
  awaitingIds: ReadonlySet<string>;
  /** Picking days by click or drag; absent when the person has no policy to request on. */
  onPick?: (start: string, end: string) => void;
  onOpenRequest: (requestId: string, options?: { decline?: boolean }) => void;
};

/**
 * The person's month on the profile's Time off tab (profile-time-off Q01–Q06, Q12): no card frame, only its grid.
 * ‹ › · the month · Today; Monday to Sunday at the company's first day; cells 112 high; the days off on the subtle
 * surface; today an accent circle; the person's office holidays tinted with their name. Leave is a pill in the
 * policy's colour — approved filled, waiting dashed with a clock — **no tooltip**; a click opens the card under it.
 * Click a day or drag across several: a light band, and letting go opens the request window with those days.
 */
export const TimeOffMonth: FC<Props> = ({ requests, policyMap, holidays, isNonWorking, awaitingIds, onPick, onOpenRequest }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const shortDates = useShortDates();
  const weekStartsOn = useWeekStartsOn();
  const today = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => dateToISO(today), [today]);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const weeks = useMemo(() => monthWeeks(cursor.year, cursor.month, weekStartsOn), [cursor, weekStartsOn]);
  const gridEnd = weeks[weeks.length - 1][6].iso;
  const gridStart = weeks[0][0].iso;
  const shown = useMemo(() => requests.filter((r) => SHOWN.has(r.status)), [requests]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  // The drag in progress ({anchor, hover}); reported on pointer-up, wherever the pointer is let go.
  const [drag, setDrag] = useState<{ anchor: string; hover: string } | null>(null);
  const band: DayRange | null = drag
    ? { start: drag.anchor <= drag.hover ? drag.anchor : drag.hover, end: drag.anchor <= drag.hover ? drag.hover : drag.anchor }
    : null;
  useEffect(() => {
    if (!drag) return;
    const finish = () => {
      const start = drag.anchor <= drag.hover ? drag.anchor : drag.hover;
      const end = drag.anchor <= drag.hover ? drag.hover : drag.anchor;
      setDrag(null);
      onPick?.(start, end);
    };
    window.addEventListener("pointerup", finish);
    return () => window.removeEventListener("pointerup", finish);
  }, [drag, onPick]);

  const step = (by: -1 | 1) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + by, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const holidaySet = useMemo(() => new Set(holidays.keys()), [holidays]);
  const backDate = (r: TimeOffRequest) => shortDates.date(backOn(r.endDate, isNonWorking, holidaySet), { weekday: true });
  const pillText = (r: TimeOffRequest) => {
    const policy = policyMap.get(r.policyId);
    const tail = r.startDate < gridStart || r.endDate > gridEnd
      ? t("month.pillBack", { date: backDate(r) })
      : t("month.pillLength", { length: lengthOf(t, r.requestedAmount, requestUnitOf(policy, r.countingMode)) });
    return { name: policy?.name ?? tCalendar("balances.fallbackName"), tail };
  };

  const card = (r: TimeOffRequest) => (
    <LeaveCard
      request={r}
      policy={policyMap.get(r.policyId)}
      backDate={backDate(r)}
      awaitingYou={awaitingIds.has(r.id)}
      onOpenFull={() => { setOpenKey(null); onOpenRequest(r.id); }}
      onDecline={() => { setOpenKey(null); onOpenRequest(r.id, { decline: true }); }}
      onDone={() => setOpenKey(null)}
    />
  );

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex h-8 items-center gap-1">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("month.previous")} onClick={() => step(-1)}
                className="text-secondary">
          <Icon icon={ArrowLeft01Icon} size="sm" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("month.next")} onClick={() => step(1)}
                className="text-secondary">
          <Icon icon={ArrowRight01Icon} size="sm" />
        </Button>
        <h2 className="ml-2 font-heading text-section-title text-primary">
          {tCalendar("period.month", { month: tCalendar(`months.long.${MONTH_KEYS[cursor.month]}`), year: String(cursor.year) })}
        </h2>
        <Button type="button" variant="secondary" size="sm" className="ml-auto"
                onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}>
          {tCommon("values.today")}
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => WEEKDAY_KEYS[(weekStartsOn + i) % 7]).map((d) => (
          <span key={d} className="pb-2 pl-2.5 text-hint font-medium text-tertiary">{tCalendar(`weekdays.short.${d}`)}</span>
        ))}
      </div>

      <div className="border border-divider">
        {weeks.map((week, w) => {
          const { segments, more } = layoutWeek(week, shown, w === 0, w === weeks.length - 1);
          const weekBand = band ? bandIn(week, band) : null;
          return (
            <div key={week[0].iso} className="relative grid h-28 grid-cols-7">
              {week.map((c, col) => {
                const names = holidays.get(c.iso);
                const off = isNonWorking(isoToDate(c.iso));
                const isToday = c.iso === todayISO;
                const bandEnd = band !== null && (c.iso === band.start || c.iso === band.end);
                return (
                  <div
                    key={c.iso}
                    data-day={c.iso}
                    onPointerDown={onPick ? (e) => { e.preventDefault(); setDrag({ anchor: c.iso, hover: c.iso }); } : undefined}
                    onPointerEnter={onPick ? () => setDrag((d) => (d ? { ...d, hover: c.iso } : d)) : undefined}
                    className={cn(
                      "flex min-w-0 flex-col gap-1 px-2.5 py-2",
                      col < 6 && "border-r border-divider",
                      w < weeks.length - 1 && "border-b border-divider",
                      names ? "bg-accent/9" : off ? "bg-subtle" : "",
                      onPick && "cursor-pointer select-none",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 inline-flex size-6 items-center justify-center rounded-pill text-label tabular-nums",
                        isToday
                          ? "bg-accent font-semibold text-on-accent"
                          : bandEnd
                            ? "bg-accent-muted text-accent-text"
                            : c.inMonth ? "text-secondary" : "text-disabled",
                      )}
                    >
                      {c.day}
                    </span>
                    {names ? (
                      <span className="truncate pl-1 text-hint font-medium text-accent-text">{names.join(", ")}</span>
                    ) : null}
                  </div>
                );
              })}

              {weekBand ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-1 rounded-popover border border-accent/22 bg-accent/4"
                  style={{ left: `calc(${weekBand.start} * 100% / 7 + 4px)`, width: `calc(${weekBand.len} * 100% / 7 - 8px)` }}
                />
              ) : null}

              {segments.map((s) => {
                const r = s.request;
                const leave = leaveClasses(policyMap.get(r.policyId)?.color);
                const waiting = r.status !== TimeOffRequestStatus.Approved;
                const text = pillText(r);
                const key = `${s.key}:${w}`;
                const fade = s.fadeLeft || s.fadeRight;
                return (
                  <Popover key={key} open={openKey === key} onOpenChange={(open) => setOpenKey(open ? key : null)}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        className={cn(
                          "absolute z-20 flex h-[26px] items-center gap-1.5 overflow-hidden px-2.5 text-left text-hint whitespace-nowrap",
                          waiting ? leave.pending : leave.approved,
                          s.fromLeft ? "border-l-0" : "rounded-l-pill",
                          s.toRight ? "border-r-0" : "rounded-r-pill",
                        )}
                        style={{
                          top: PILL_TOP + s.lane * LANE_STEP,
                          left: `calc(${s.startCol} * 100% / 7 + ${s.fromLeft ? 0 : 6}px)`,
                          width: `calc(${s.endCol - s.startCol + 1} * 100% / 7 - ${(s.fromLeft ? 0 : 6) + (s.toRight ? 0 : 6)}px)`,
                          ...(fade
                            ? {
                                maskImage: `linear-gradient(to ${s.fadeRight ? "right" : "left"}, black calc(100% - 40px), transparent)`,
                              }
                            : {}),
                        }}
                      >
                        {waiting ? <Icon icon={Clock01Icon} size="sm" className="size-3.5 shrink-0" /> : null}
                        <span className="truncate font-medium">
                          {text.name} <span className="font-normal">{text.tail}</span>
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="center" sideOffset={6} className="w-auto p-4">
                      {card(r)}
                    </PopoverContent>
                  </Popover>
                );
              })}

              {more.map((m) => {
                const moreKey = ["more", w, m.col].join(":");
                return (
                <MoreOnDay
                  key={moreKey}
                  day={week[m.col]}
                  week={week}
                  col={m.col}
                  count={m.count}
                  requests={shown.filter((r) => r.startDate <= week[m.col].iso && r.endDate >= week[m.col].iso)}
                  policyMap={policyMap}
                  open={openKey === moreKey}
                  onOpenChange={(open) => setOpenKey(open ? moreKey : null)}
                  renderCard={card}
                />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The columns a range covers in one week row. */
const bandIn = (week: MonthCell[], range: DayRange): { start: number; len: number } | null => {
  const cols = week.map((c, i) => (inRange(c.iso, range) ? i : -1)).filter((i) => i >= 0);
  return cols.length ? { start: cols[0], len: cols[cols.length - 1] - cols[0] + 1 } : null;
};

/**
 * "+3 more" on a crowded day (Q05b) and the list it opens (Q05f): 300 wide, the day and how many requests, then a row
 * per request — marker, policy, dates, and a small Mon–Sun strip of its days with this day outlined. A row opens the
 * usual card in the same place.
 */
const MoreOnDay: FC<{
  day: MonthCell;
  week: MonthCell[];
  col: number;
  count: number;
  requests: TimeOffRequest[];
  policyMap: Map<string, TimeOffPolicy>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderCard: (r: TimeOffRequest) => ReactNode;
}> = ({ day, week, col, count, requests, policyMap, open, onOpenChange, renderCard }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const [picked, setPicked] = useState<TimeOffRequest | null>(null);
  useEffect(() => { if (!open) setPicked(null); }, [open]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute z-20 flex h-7 items-center rounded-pill bg-mist px-2.5 text-hint font-medium text-secondary hover:bg-divider"
          style={{
            top: PILL_TOP + (LANES - 1) * LANE_STEP - 1,
            left: `calc(${col} * 100% / 7 + 6px)`,
            width: `calc(100% / 7 - 12px)`,
          }}
        >
          {t("month.more", { count })}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" sideOffset={6} className={cn("p-4", picked ? "w-auto" : "w-[300px]")}>
        {picked ? (
          renderCard(picked)
        ) : (
          <>
            <p className="flex items-baseline gap-2">
              <span className="text-body font-semibold text-primary">{shortDates.date(day.iso, { weekday: true })}</span>
              <span className="text-hint text-tertiary">{t("month.requestsOnDay", { count: requests.length })}</span>
            </p>
            <ul className="mt-2 flex flex-col">
              {requests.map((r) => {
                const policy = policyMap.get(r.policyId);
                const leave = leaveClasses(policy?.color);
                const waiting = r.status !== TimeOffRequestStatus.Approved;
                return (
                  <li key={r.id}>
                    <button type="button" onClick={() => setPicked(r)}
                            className="flex w-full items-center gap-2 rounded-control py-1.5 text-left hover:bg-subtle">
                      <PolicyMarker color={policy?.color} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-medium text-primary">
                          {policy?.name ?? tCalendar("balances.fallbackName")}
                        </span>
                        <span className="block truncate text-hint text-tertiary">{shortDates.range(r.startDate, r.endDate)}</span>
                      </span>
                      <span className="flex shrink-0 gap-0.5" aria-hidden>
                        {week.map((c, i) => (
                          <span
                            key={c.iso}
                            className={cn(
                              "size-2.5 rounded-glyph",
                              inRange(c.iso, { start: r.startDate, end: r.endDate })
                                ? waiting ? cn("border border-dashed bg-card", leave.border) : leave.edge
                                : "bg-mist",
                              i === col && "ring-1 ring-primary ring-offset-1",
                            )}
                          />
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
