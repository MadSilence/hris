"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";
import { dateToISO, isoToDate, useWeekStartsOn } from "@/lib/date";
import { MONTH_KEYS, WEEKDAY_KEYS } from "@/components/modules/calendar/lib/dateRange";
import { inRange, monthsLayout, monthsOf, monthWeeks, type DayRange } from "@/components/modules/timeOff/lib/leaveDays";

/**
 * The month a request's days are picked on and shown on (profile-time-off Q13, Q30, Q30d, Q30f): a bordered box,
 * radius 16; the weekdays as letters; the company's days off as grey tiles; the person's office holidays tinted;
 * today ringed. The range is drawn by the one rule (`7-product-wide/DATE-RANGE.md`, `FORMS_AND_FIELDS.md` § "Date
 * fields"): the first and last day filled accent circles, the band between them the accent at 6 % from the centre of
 * the first circle to the centre of the last, as tall as the circles (34 here, 28 in the small grids), no rounded ends;
 * days off inside it take the band too; a range from the month before comes in from the grid's left edge. Read-only
 * when `onDayClick` is absent.
 */
type MonthProps = {
  year: number;
  month: number;
  range: DayRange | null;
  /** The range is still being chosen: the end is the day under the pointer — a subtle circle in an accent ring. */
  preview?: boolean;
  /** `md` the request window (cells 38, circle 34); `sm` two months side by side (32 / 28). */
  size?: "md" | "sm";
  /** The neighbours' days: dimmed (one month) or left blank (two months). */
  otherMonthDays?: "dim" | "blank";
  holidays?: ReadonlySet<string>;
  isNonWorking: (d: Date) => boolean;
  /** Arrows either side of the month's name — the request window. */
  onStep?: (by: -1 | 1) => void;
  onDayClick?: (iso: string) => void;
  onDayHover?: (iso: string | null) => void;
  className?: string;
};

const useMonthTitle = () => {
  const t = useTranslations("calendar");
  return (year: number, month: number) =>
    t("period.month", { month: t(`months.long.${MONTH_KEYS[month]}`), year: String(year) });
};

const useWeekdayLetters = () => {
  const t = useTranslations("calendar");
  const weekStartsOn = useWeekStartsOn();
  return Array.from({ length: 7 }, (_, i) => {
    const key = WEEKDAY_KEYS[(weekStartsOn + i) % 7];
    return { key, label: t(`weekdays.narrow.${key}`) };
  });
};

export const LeaveMonthGrid: React.FC<MonthProps> = ({
  year,
  month,
  range,
  preview = false,
  size = "md",
  otherMonthDays = "dim",
  holidays,
  isNonWorking,
  onStep,
  onDayClick,
  onDayHover,
  className,
}) => {
  const t = useTranslations("leave");
  const title = useMonthTitle();
  const letters = useWeekdayLetters();
  const weekStartsOn = useWeekStartsOn();
  const weeks = React.useMemo(() => monthWeeks(year, month, weekStartsOn), [year, month, weekStartsOn]);
  const todayISO = dateToISO(new Date());
  const cell = size === "md" ? "h-[38px]" : "h-8";
  const circle = size === "md" ? "size-[34px]" : "size-7";

  return (
    <div className={cn("rounded-card border border-divider px-4 pt-3 pb-3.5", className)}>
      {onStep ? (
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("month.previous")} onClick={() => onStep(-1)}>
            <Icon icon={ArrowLeft01Icon} size="sm" />
          </Button>
          <p className="text-body font-semibold text-primary">{title(year, month)}</p>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("month.next")} onClick={() => onStep(1)}>
            <Icon icon={ArrowRight01Icon} size="sm" />
          </Button>
        </div>
      ) : (
        <p className="mb-2 text-body font-semibold text-primary">{title(year, month)}</p>
      )}

      <div className="grid grid-cols-7 pb-1">
        {letters.map((l, i) => (
          <span key={`${l.key}-${i}`} className="text-center text-hint font-medium text-tertiary">
            {l.label}
          </span>
        ))}
      </div>

      <div onMouseLeave={onDayHover ? () => onDayHover(null) : undefined}>
        {weeks.map((week) => (
          <div key={week[0].iso} className="grid grid-cols-7">
            {week.map((c) => {
              const blank = !c.inMonth && otherMonthDays === "blank";
              const date = isoToDate(c.iso);
              const off = isNonWorking(date);
              // A blank neighbour's day still carries the band, so a range from the month before comes in from the edge.
              const band = inRange(c.iso, range);
              const isStart = band && !blank && c.iso === range?.start;
              const isEnd = band && !blank && (c.iso === range?.end || isStart) && !(preview && c.iso === range?.end);
              const previewEnd = band && !blank && preview && c.iso === range?.end;
              const bandStart = c.iso === range?.start;
              const bandEnd = c.iso === range?.end;
              const holiday = !blank && Boolean(holidays?.has(c.iso));
              const today = !blank && c.iso === todayISO;
              const Day = onDayClick && !blank ? "button" : "span";
              return (
                <div key={c.iso} className={cn("relative flex items-center justify-center", cell, off && !band && "bg-mist")}>
                  {band && !(bandStart && bandEnd) ? (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-y-0.5 bg-accent-subtle",
                        bandStart ? "right-0 left-1/2" : bandEnd ? "right-1/2 left-0" : "inset-x-0",
                      )}
                    />
                  ) : null}
                  {blank ? null : (
                    <Day
                      {...(Day === "button"
                        ? {
                            type: "button" as const,
                            onClick: () => onDayClick?.(c.iso),
                            onMouseEnter: onDayHover ? () => onDayHover(c.iso) : undefined,
                          }
                        : {})}
                      data-day={c.iso}
                      className={cn(
                        "relative inline-flex items-center justify-center rounded-pill text-label tabular-nums",
                        circle,
                        Day === "button" && !isEnd && !band && "hover:bg-mist",
                        isEnd
                          ? "bg-accent font-semibold text-on-accent"
                          : previewEnd
                            ? "bg-accent-subtle text-primary ring-[1.5px] ring-accent ring-inset"
                          : holiday
                            ? "bg-accent/9 text-accent-text"
                            : c.inMonth
                              ? "font-normal text-primary"
                              : "font-normal text-disabled",
                        today && !isEnd && "ring-1 ring-accent ring-inset",
                      )}
                    >
                      {c.day}
                    </Day>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Many months in one row (Q30f): each month a small grid of squares — the leave's working days filled in the accent
 * at 45 %, the days off a darker grey, the rest Mist; the neighbours' days blank.
 */
export const LeaveMonthsStrip: React.FC<{
  range: DayRange;
  isNonWorking: (d: Date) => boolean;
  className?: string;
}> = ({ range, isNonWorking, className }) => {
  const t = useTranslations("calendar");
  const weekStartsOn = useWeekStartsOn();
  const months = monthsOf(range);
  return (
    <div className={cn("grid grid-cols-7 gap-2.5 rounded-card border border-divider px-4 pt-3 pb-3.5", className)}>
      {months.map(({ year, month }) => (
        <div key={`${year}-${month}`} className="min-w-0">
          <p className="mb-1.5 text-hint font-medium text-secondary">{t(`months.short.${MONTH_KEYS[month]}`)}</p>
          <div className="grid grid-cols-7 gap-0.5">
            {monthWeeks(year, month, weekStartsOn).flat().map((c) => {
              if (!c.inMonth) return <span key={c.iso} className="aspect-square" />;
              const off = isNonWorking(isoToDate(c.iso));
              const leave = !off && inRange(c.iso, range);
              return (
                <span
                  key={c.iso}
                  data-leave={leave || undefined}
                  className={cn("aspect-square rounded-glyph", leave ? "bg-accent/45" : off ? "bg-divider" : "bg-mist")}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/** A request's days, one month, two side by side, or many in a row — whichever fits (Q30, Q30d, Q30f). */
export const LeaveDays: React.FC<{
  range: DayRange;
  holidays?: ReadonlySet<string>;
  isNonWorking: (d: Date) => boolean;
}> = ({ range, holidays, isNonWorking }) => {
  const weekStartsOn = useWeekStartsOn();
  const layout = monthsLayout(range, weekStartsOn);
  const start = isoToDate(range.start);
  if (layout === "many") return <LeaveMonthsStrip range={range} isNonWorking={isNonWorking} />;
  if (layout === "one") {
    return (
      <LeaveMonthGrid year={start.getFullYear()} month={start.getMonth()} range={range} holidays={holidays}
                      isNonWorking={isNonWorking} />
    );
  }
  const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return (
    <div className="grid grid-cols-2 gap-3">
      <LeaveMonthGrid year={start.getFullYear()} month={start.getMonth()} range={range} holidays={holidays}
                      isNonWorking={isNonWorking} size="sm" otherMonthDays="blank" className="px-2.5" />
      <LeaveMonthGrid year={next.getFullYear()} month={next.getMonth()} range={range} holidays={holidays}
                      isNonWorking={isNonWorking} size="sm" otherMonthDays="blank" className="px-2.5" />
    </div>
  );
};
