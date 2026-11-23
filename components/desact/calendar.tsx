"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { dateToISO, useDisplayLocale, useWeekStartsOn } from "@/lib/date";
import { ChoiceMenu } from "./choice-menu";
import { Icon } from "./icon";

/*
 * The month behind every date field (the designers' X5 and AQ-02, `7-product-wide/DATE-RANGE.md`; the rules in
 * `technical_documentation/ui/FORMS_AND_FIELDS.md` § "Date fields"). 300 wide, 12 in. The header is the month and the
 * year as two small menu buttons, ‹ › on the right: the month opens the single-choice menu of the twelve, the year
 * turns the same box into a scrolling grid of years, three a row (this year in accent text, the picked one filled,
 * radius 8), and one click returns to that year's days. Only the month's own days are drawn. Footer under a hairline:
 * Today (accent) on the left, Clear (secondary) on the right.
 *
 * **A single day** (X04): cells 36 high, the picked day a 32 accent circle with a white 600 number; today in accent
 * text, 600.
 *
 * **A range** (DATE-RANGE, measured in AQ02): cells 34 high, circles 30. The first and last day are filled accent
 * circles with a white 600 number; the band between them is the accent at 6 % (`accent-subtle`), **from the centre of
 * the first circle to the centre of the last, as tall as the circles**, with no rounded ends (the circles round it).
 * It runs on to the row's edges between weeks, and **from the grid's left edge when the range began in the month
 * before** (and to its right edge when it goes on into the next). A range of one day is just the circle. While only
 * the first day is picked, the same band follows the pointer, the day under it a subtle circle in a 1.5 px accent ring.
 */

export type CalendarRange = { from: Date; to?: Date };

type BaseProps = {
  /** The month shown first; the picked date's, or today's, when absent. */
  defaultMonth?: Date;
  /** A day that may not be picked (outside the field's bounds). */
  isDisabled?: (day: Date) => boolean;
  /** The footer's Today. Absent, no Today. */
  onToday?: () => void;
  /** The footer's Clear. Absent, no Clear. */
  onClear?: () => void;
  className?: string;
};

export type CalendarProps = BaseProps &
  (
    | { mode: "single"; selected?: Date; onSelect: (day: Date) => void }
    | { mode: "range"; selected?: CalendarRange; onSelect: (day: Date) => void }
  );

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameDay = (a: Date | undefined, b: Date | undefined) => Boolean(a && b && dateToISO(a) === dateToISO(b));

/** The month's weeks: each a row of seven, a day of another month `null`. */
const weeksOf = (month: Date, weekStartsOn: number): (Date | null)[][] => {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
};

const YEARS_BACK = 100;
const YEARS_AHEAD = 30;

function Calendar(props: CalendarProps) {
  const { defaultMonth, isDisabled, onToday, onClear, className } = props;
  const t = useTranslations("common");
  const locale = useDisplayLocale();
  const weekStartsOn = useWeekStartsOn();
  const today = React.useMemo(() => new Date(), []);
  const isRange = props.mode === "range";
  const single = props.mode === "single" ? props.selected : undefined;
  const range = props.mode === "range" ? props.selected : undefined;

  const [month, setMonth] = React.useState(() => startOfMonth(defaultMonth ?? single ?? range?.from ?? today));
  // A date typed into the field moves the month to it.
  const anchorISO = defaultMonth ? dateToISO(startOfMonth(defaultMonth)) : null;
  React.useEffect(() => {
    if (defaultMonth) setMonth(startOfMonth(defaultMonth));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the month follows the anchor's month, not its identity
  }, [anchorISO]);

  const [view, setView] = React.useState<"days" | "years">("days");
  const [pointer, setPointer] = React.useState<Date | null>(null);

  const monthNames = React.useMemo(
    () => Array.from({ length: 12 }, (_, m) => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2000, m, 1))),
    [locale],
  );
  const weekdays = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        // 2 Jan 2000 was a Sunday.
        const d = new Date(2000, 0, 2 + ((weekStartsOn + i) % 7));
        return {
          short: new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d),
          long: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d),
        };
      }),
    [locale, weekStartsOn],
  );
  const weeks = React.useMemo(() => weeksOf(month, weekStartsOn), [month, weekStartsOn]);

  // The band: a picked range, or — while only its first day is picked — the stretch to the day under the pointer.
  const choosing = Boolean(range?.from && !range.to);
  const band = React.useMemo(() => {
    if (!range?.from) return null;
    const end = range.to ?? (choosing && pointer ? pointer : null);
    if (!end) return null;
    const [from, to] = range.from <= end ? [range.from, end] : [end, range.from];
    return { from: dateToISO(from), to: dateToISO(to) };
  }, [range?.from, range?.to, choosing, pointer]);

  const step = (by: -1 | 1) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));

  const header = (
    <div className="mb-2 flex h-7 items-center justify-between">
      <span className="flex items-center gap-1">
        <ChoiceMenu
          label={t("datePicker.month")}
          options={monthNames.map((name, m) => ({ value: m, label: name }))}
          value={month.getMonth()}
          onChange={(m) => {
            setMonth(new Date(month.getFullYear(), m, 1));
            setView("days");
          }}
          className="max-h-80 w-44"
          trigger={
            <button type="button" className={headerButton}>
              {monthNames[month.getMonth()]}
              <Icon icon={ArrowDown01Icon} size="sm" className="size-3 text-primary" />
            </button>
          }
        />
        <button
          type="button"
          aria-expanded={view === "years"}
          aria-label={t("datePicker.year")}
          onClick={() => setView((v) => (v === "years" ? "days" : "years"))}
          className={cn(headerButton, view === "years" && "bg-mist")}
        >
          {month.getFullYear()}
          <Icon icon={ArrowDown01Icon} size="sm" className="size-3 text-primary" />
        </button>
      </span>
      {view === "days" ? (
        <span className="flex items-center gap-1">
          <button type="button" aria-label={t("datePicker.previousMonth")} onClick={() => step(-1)} className={navButton}>
            <Icon icon={ArrowLeft01Icon} size="sm" />
          </button>
          <button type="button" aria-label={t("datePicker.nextMonth")} onClick={() => step(1)} className={navButton}>
            <Icon icon={ArrowRight01Icon} size="sm" />
          </button>
        </span>
      ) : null}
    </div>
  );

  const years = React.useMemo(() => {
    const now = today.getFullYear();
    const first = Math.min(now - YEARS_BACK, month.getFullYear());
    const last = Math.max(now + YEARS_AHEAD, month.getFullYear());
    return Array.from({ length: last - first + 1 }, (_, i) => first + i);
  }, [today, month]);
  const yearsRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (view !== "years") return;
    yearsRef.current
      ?.querySelector<HTMLElement>(`[data-year="${month.getFullYear()}"]`)
      ?.scrollIntoView?.({ block: "center" });
  }, [view, month]);

  const yearGrid = (
    <div ref={yearsRef} className="scroll-thumb mt-1 max-h-[236px] overflow-y-auto pr-2.5" role="listbox" aria-label={t("datePicker.year")}>
      <div className="grid grid-cols-3 gap-1.5">
        {years.map((y) => {
          const on = y === month.getFullYear();
          return (
            <button
              key={y}
              type="button"
              role="option"
              aria-selected={on}
              data-year={y}
              onClick={() => {
                setMonth(new Date(y, month.getMonth(), 1));
                setView("days");
              }}
              className={cn(
                "h-10 rounded-control text-body tabular-nums outline-none focus-visible:shadow-focus",
                on
                  ? "bg-accent font-semibold text-on-accent"
                  : y === today.getFullYear()
                    ? "font-semibold text-accent-text hover:bg-mist"
                    : "text-primary hover:bg-mist",
              )}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );

  const cellHeight = isRange ? "h-[34px]" : "h-9";
  const circle = isRange ? "size-[30px] text-label font-normal" : "size-8 text-body";

  const firstISO = dateToISO(startOfMonth(month));
  const lastISO = dateToISO(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const days = (
    <div role="grid" aria-label={`${monthNames[month.getMonth()]} ${month.getFullYear()}`} onMouseLeave={() => setPointer(null)}>
      <div role="row" className="grid grid-cols-7">
        {weekdays.map((w, i) => (
          <span key={i} role="columnheader" aria-label={w.long} className="h-6 text-center text-hint leading-6 font-medium text-tertiary">
            {w.short}
          </span>
        ))}
      </div>
      {weeks.map((week, w) => (
        <div key={w} role="row" className="grid grid-cols-7">
          {week.map((day, col) => {
            // A blank cell carries the band only where the range goes on past the month: from the grid's left edge
            // when it began in the month before, to its right edge when it ends in the next.
            if (!day) {
              const before = w === 0;
              const carried =
                band !== null && (before ? band.from < firstISO && band.to >= firstISO : band.to > lastISO && band.from <= lastISO);
              return (
                <span key={col} role="gridcell" aria-hidden className={cn("relative", cellHeight)}>
                  {carried ? <span aria-hidden className={cn(bandClass, "inset-x-0")} /> : null}
                </span>
              );
            }
            const iso = dateToISO(day);
            const off = isDisabled?.(day) ?? false;
            const inBand = band !== null && iso >= band.from && iso <= band.to;
            const bandStart = band !== null && iso === band.from;
            const bandEnd = band !== null && iso === band.to;
            const isEnd = isRange
              ? sameDay(day, range?.from) || sameDay(day, range?.to)
              : sameDay(day, single);
            const previewEnd = isRange && choosing && pointer !== null && sameDay(day, pointer) && !isEnd;
            const isToday = sameDay(day, today);
            return (
              <span key={col} role="gridcell" className={cn("relative flex items-center justify-center", cellHeight)}>
                {inBand && !(bandStart && bandEnd) ? (
                  <span
                    aria-hidden
                    className={cn(bandClass, bandStart ? "right-0 left-1/2" : bandEnd ? "right-1/2 left-0" : "inset-x-0")}
                  />
                ) : null}
                <button
                  type="button"
                  disabled={off}
                  aria-pressed={isEnd}
                  aria-label={new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(day)}
                  data-day={iso}
                  data-preview-end={previewEnd || undefined}
                  data-in-range={inBand || undefined}
                  onClick={() => props.onSelect(day)}
                  onMouseEnter={() => isRange && setPointer(day)}
                  onFocus={() => isRange && setPointer(day)}
                  className={cn(
                    "relative inline-flex items-center justify-center rounded-pill tabular-nums outline-none transition-colors duration-(--duration-hover)",
                    "focus-visible:shadow-focus",
                    circle,
                    isEnd
                      ? "bg-accent font-semibold text-on-accent"
                      : previewEnd
                        ? "bg-accent-subtle text-primary ring-[1.5px] ring-accent ring-inset"
                        : off
                          ? "cursor-default text-disabled"
                          : isToday
                            ? "font-semibold text-accent-text hover:bg-mist"
                            : cn("text-primary", !inBand && "hover:bg-mist"),
                  )}
                >
                  {day.getDate()}
                </button>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("w-[300px] p-3 tabular-nums", className)} data-slot="calendar">
      {header}
      {view === "years" ? yearGrid : days}
      {onToday || onClear ? (
        <div className="-mx-3 mt-2 flex items-center justify-between border-t border-divider px-3 pt-2.5">
          {onToday ? (
            <button type="button" onClick={onToday} className="rounded-control text-label text-accent-text outline-none hover:underline focus-visible:shadow-focus">
              {t("datePicker.today")}
            </button>
          ) : (
            <span />
          )}
          {onClear ? (
            <button type="button" onClick={onClear} className="rounded-control text-label text-secondary outline-none hover:text-primary focus-visible:shadow-focus">
              {t("datePicker.clear")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const headerButton =
  "inline-flex h-7 items-center gap-1 rounded-control px-2 text-body font-semibold text-primary outline-none hover:bg-mist focus-visible:shadow-focus data-[state=open]:bg-mist";
const navButton =
  "inline-flex size-7 items-center justify-center rounded-control text-secondary outline-none hover:bg-mist focus-visible:shadow-focus";
/** The band: the accent at 6 %, as tall as the circles, centred in the cell. */
const bandClass = "absolute top-1/2 h-[calc(100%-4px)] -translate-y-1/2 bg-accent-subtle";

export { Calendar };
