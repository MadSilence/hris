"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/desact/popover";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { partsToISO, threeLetterMonths, useDisplayLocale, useShortDates, useWeekStartsOn } from "@/lib/date";
import type { ScheduleFrequency, TriggerSpec } from "@/models/automations";
import { cn } from "@/lib/cn";
import { CompactPick } from "../conditions/chrome";
import { Field, FieldStack, Hint, Indented, TimeInput } from "../parts/parts";
import { errorFor } from "../parts/problems";
import type { TriggerPartProps } from "./triggerPartProps";

const FREQUENCIES: ScheduleFrequency[] = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;
type Weekday = (typeof WEEKDAYS)[number];
const WEEKS = [1, 2, 3, 4, 0] as const;
export const PERSON_ZONE = "PERSON";
export const COMPANY_ZONE = "COMPANY";

/** What a frequency starts with when it is picked — every field it does not use cleared. */
export const scheduleDefaults = (frequency: ScheduleFrequency): Partial<TriggerSpec> => {
  const clear = { weekdays: null, dayOfMonth: null, weekOfMonth: null, monthOfPeriod: null };
  switch (frequency) {
    case "WEEKLY":
      return { ...clear, frequency, weekdays: [1] };
    case "MONTHLY":
      return { ...clear, frequency, dayOfMonth: 1 };
    case "QUARTERLY":
      return { ...clear, frequency, monthOfPeriod: 1, dayOfMonth: 1 };
    case "YEARLY":
      return { ...clear, frequency, monthOfPeriod: 1, dayOfMonth: 1 };
    default:
      return { ...clear, frequency };
  }
};

/** The days of a month in a leap year — a yearly date may be 29 February. */
const daysIn = (month: number): number => new Date(2024, month, 0).getDate();

/** Every IANA zone the browser knows. */
const allZones = (): string[] => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  return intl.supportedValuesOf?.("timeZone") ?? [];
};

/** A day cell (C25, C31): 32 high, 13/20, no border; the picked day a 28 circle in the muted accent, 600. */
const DayCell: React.FC<{ day: number; picked: boolean; onPick: () => void }> = ({ day, picked, onPick }) => (
  <button
    type="button"
    aria-pressed={picked}
    onClick={onPick}
    className="group flex h-8 items-center justify-center rounded-control outline-none focus-visible:shadow-focus"
  >
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-pill text-label leading-5 tabular-nums",
        picked ? "bg-accent-muted font-semibold text-accent-text" : "font-normal text-primary group-hover:bg-mist",
      )}
    >
      {day}
    </span>
  </button>
);

/**
 * One day of the month, or the last (0) — C25: one grid box, 1 px divider, radius 10, 8 inside, 2 between cells of
 * 40 × 32; "Last day" spans four cells.
 */
const DayGrid: React.FC<{ value: number | null | undefined; onChange: (day: number) => void; max?: number; lastDay?: boolean; label: string }> = ({
  value,
  onChange,
  max = 31,
  lastDay = true,
  label,
}) => {
  const t = useTranslations("automationsSettings");
  return (
    <div role="group" aria-label={label} className="grid grid-cols-7 gap-0.5 rounded-popover border border-divider p-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((d) => (
        <DayCell key={d} day={d} picked={value === d} onPick={() => onChange(d)} />
      ))}
      {lastDay && (
        <button
          type="button"
          aria-pressed={value === 0}
          onClick={() => onChange(0)}
          className={cn(
            "col-span-4 flex h-8 items-center justify-center rounded-control text-label leading-5 outline-none focus-visible:shadow-focus",
            value === 0 ? "bg-accent-muted font-semibold text-accent-text" : "font-normal text-secondary hover:bg-mist",
          )}
        >
          {t("schedule.lastDay")}
        </button>
      )}
    </div>
  );
};

/**
 * The yearly date (C31): one field showing the date without a year ("1 March"), which opens a picker — the month with
 * its arrows, no year; the day grid; the hint inside the popover.
 */
const YearDateField: React.FC<{ month: number; day: number; onChange: (month: number, day: number) => void; label: string }> = ({
  month,
  day,
  onChange,
  label,
}) => {
  const t = useTranslations("automationsSettings");
  const short = useShortDates();
  const monthNames = useMonthNames("long");
  const [open, setOpen] = React.useState(false);
  const [shown, setShown] = React.useState(month);
  React.useEffect(() => {
    if (open) setShown(month);
  }, [open, month]);
  // A leap year, so 29 February can be picked: it runs on 28 February in the others (the hint says so).
  const text = short.long(partsToISO(2024, month - 1, Math.min(day || 1, daysIn(month))), { hideYear: true });
  const step = (delta: number) => setShown((m) => ((m - 1 + delta + 12) % 12) + 1);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-control border bg-card px-3 text-body text-primary outline-none transition-[border-color,box-shadow]",
            open ? "border-accent shadow-focus" : "border-field hover:border-field-hover focus-visible:border-accent focus-visible:shadow-focus",
          )}
        >
          <span className="truncate">{text}</span>
          <Icon icon={ArrowDown01Icon} size="sm" className="shrink-0 text-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] rounded-tint border border-divider bg-card p-3 shadow-bar">
        <div className="flex h-9 items-center justify-between pb-2">
          <button type="button" aria-label={t("schedule.previousMonth")} onClick={() => step(-1)}
            className="flex size-7 items-center justify-center rounded-control text-secondary outline-none hover:bg-mist focus-visible:shadow-focus">
            <Icon icon={ArrowLeft01Icon} size="sm" />
          </button>
          <span className="text-body font-semibold text-primary">{monthNames[shown - 1]}</span>
          <button type="button" aria-label={t("schedule.nextMonth")} onClick={() => step(1)}
            className="flex size-7 items-center justify-center rounded-control text-secondary outline-none hover:bg-mist focus-visible:shadow-focus">
            <Icon icon={ArrowRight01Icon} size="sm" />
          </button>
        </div>
        <div role="group" aria-label={monthNames[shown - 1]} className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: daysIn(shown) }, (_, i) => i + 1).map((d) => (
            <DayCell
              key={d}
              day={d}
              picked={shown === month && d === day}
              onPick={() => {
                onChange(shown, d);
                setOpen(false);
              }}
            />
          ))}
        </div>
        <p className="px-1 pt-2 text-hint text-tertiary">{t("schedule.yearHint")}</p>
      </PopoverContent>
    </Popover>
  );
};

/** The seven days from the company's first day of the week: several (a week) or one (a month's weekday). */
const WeekdayButtons: React.FC<{ value: number[]; onChange: (days: number[]) => void; single?: boolean; label: string }> = ({
  value,
  onChange,
  single = false,
  label,
}) => {
  const tA = useTranslations("automations");
  // ISO numbers (1 = Monday … 7 = Sunday), laid out from the company's first day (0 = Sunday as Date counts).
  const weekStartsOn = useWeekStartsOn();
  const days = React.useMemo(
    () => WEEKDAYS.map((_, i) => (((weekStartsOn + 6 + i) % 7) + 1) as Weekday),
    [weekStartsOn],
  );
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {days.map((d: Weekday) => {
        const picked = value.includes(d);
        return (
          <button
            key={d}
            type="button"
            aria-pressed={picked}
            onClick={() => {
              if (single) onChange([d]);
              else onChange(picked ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b));
            }}
            className={cn(
              // C29: 32 high, radius 8, 13/20 500; picked in the muted accent, no border; the others outlined.
              "inline-flex h-8 flex-1 items-center justify-center rounded-control border text-label leading-5 outline-none focus-visible:shadow-focus",
              picked ? "border-transparent bg-accent-muted text-accent-text" : "border-field bg-transparent text-primary hover:bg-mist",
            )}
          >
            {tA(`weekdayShort.${d}`)}
          </button>
        );
      })}
    </div>
  );
};

/** The city of an IANA zone: "Europe/Warsaw" → "Warsaw". */
const cityOf = (zone: string): string => (zone.split("/").pop() ?? zone).replace(/_/g, " ");

/**
 * The second lines of the time zone list (C32): who gets it when in each person's zone — the reader themselves, in the
 * zone of this browser — the company's zone by its name ("Europe/Vilnius · everyone at the same moment"), any zone.
 */
const useZoneLines = (at: string, companyZone: string | null | undefined): Record<"PERSON" | "COMPANY" | "PICK", string> => {
  const t = useTranslations("automationsSettings");
  const { user } = useCurrentUser();
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const city = cityOf(zone);
  return {
    PERSON: user?.firstName
      ? t("schedule.zoneLine.PERSON", { name: user.firstName, city, time: at })
      : t("schedule.zoneHint.PERSON"),
    COMPANY: companyZone ? t("schedule.zoneLine.COMPANY", { zone: companyZone }) : t("schedule.zoneHint.COMPANY"),
    PICK: t("schedule.zoneHint.PICK"),
  };
};

/** Month names in the page's language, January first. */
const useMonthNames = (style: "long" | "short") => {
  const locale = useDisplayLocale();
  return React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: style });
    return Array.from({ length: 12 }, (_, m) => threeLetterMonths(f.format(new Date(2024, m, 1))));
  }, [locale, style]);
};

/** "Runs on 1 Jan, 1 Apr, 1 Jul and 1 Oct." — the quarter's four dates in words. */
const useQuarterHint = (monthOfPeriod: number, day: number) => {
  const t = useTranslations("automationsSettings");
  const short = useShortDates();
  const locale = useDisplayLocale();
  const months = [0, 3, 6, 9].map((o) => monthOfPeriod - 1 + o);
  const list = new Intl.ListFormat(locale, { type: "conjunction" });
  const shortMonths = useMonthNames("short");
  if (day === 0) return t("schedule.quarterLastHint", { months: list.format(months.map((m) => shortMonths[m])) });
  // C30: "Runs on 1 Jan, 1 Apr, 1 Jul and 1 Oct." — no comma before "and", whatever the language's list says.
  const year = new Date().getFullYear();
  // The month's length in this year, not in a leap one: 31 in a quarter's second month is 28 February in 2026, and
  // counted against 2024's 29 it rolled over to "1 Mar" (walk of 2026-11-07).
  const dates = months.map((m) => short.date(partsToISO(year, m, Math.min(day, new Date(year, m + 1, 0).getDate()))));
  return t("schedule.quarterHintList", { head: dates.slice(0, -1).join(", "), last: dates[dates.length - 1] });
};

/**
 * Schedule (T4a–T4d): every day, week, month, quarter or year; for a week its days, for a month a day or a weekday,
 * for a quarter its month and day, for a year a month and day without a year; then the time and the time zone.
 */
export const ScheduleFields: React.FC<TriggerPartProps> = ({ trigger, catalog, problems, onTrigger }) => {
  const t = useTranslations("automationsSettings");
  const everyId = React.useId();
  const frequency = trigger.frequency ?? "MONTHLY";
  const zoneLines = useZoneLines(trigger.at ?? "09:00", catalog.companyTimeZone);
  const quarterHint = useQuarterHint(trigger.monthOfPeriod ?? 1, trigger.dayOfMonth ?? 1);
  const weekdayMode = trigger.weekOfMonth != null;
  const zone = trigger.timeZone ?? PERSON_ZONE;
  const zoneMode = zone === PERSON_ZONE || zone === COMPANY_ZONE ? zone : "PICK";
  const zones = React.useMemo(() => allZones().map((z) => ({ value: z, label: z.replace(/_/g, " ") })), []);
  const err = (f: string) => errorFor(t, problems, `trigger.${f}`);

  return (
    <FieldStack>
      <Field label={t("schedule.every")} labelId={everyId} error={err("frequency")}>
        <SegmentedControl<ScheduleFrequency>
          size="window"
          aria-labelledby={everyId}
          value={frequency}
          onChange={(next) => onTrigger(scheduleDefaults(next))}
          options={FREQUENCIES.map((f) => ({ value: f, label: t(`schedule.frequency.${f}`) }))}
        />
      </Field>

      {frequency === "WEEKLY" && (
        <Field label={t("schedule.on")} error={err("weekdays")}>
          <WeekdayButtons label={t("schedule.on")} value={trigger.weekdays ?? []} onChange={(weekdays) => onTrigger({ weekdays })} />
        </Field>
      )}

      {frequency === "MONTHLY" && (
        <Field label={t("schedule.on")} error={err("dayOfMonth") ?? err("weekOfMonth") ?? err("weekdays")}>
          <RadioGroup
            className="gap-2.5"
            value={weekdayMode ? "WEEKDAY" : "DAY"}
            onValueChange={(v) =>
              onTrigger(
                v === "WEEKDAY"
                  ? { weekOfMonth: 1, weekdays: [1], dayOfMonth: null }
                  : { weekOfMonth: null, weekdays: null, dayOfMonth: 1 },
              )
            }
            aria-label={t("schedule.on")}
          >
            <label className="flex cursor-pointer items-center gap-2.5">
              <RadioGroupItem value="DAY" />
              <span className="text-body">{t("schedule.dayOfMonth")}</span>
            </label>
            {!weekdayMode && (
              <Indented>
                <DayGrid label={t("schedule.dayOfMonth")} value={trigger.dayOfMonth} onChange={(dayOfMonth) => onTrigger({ dayOfMonth })} />
                <Hint>{t("schedule.shortMonthHint")}</Hint>
              </Indented>
            )}
            <label className="flex cursor-pointer items-center gap-2.5">
              <RadioGroupItem value="WEEKDAY" />
              <span className="text-body">{t("schedule.weekday")}</span>
            </label>
            {weekdayMode && (
              <Indented>
                <CompactPick
                  size="md"
                  options={WEEKS.map((w) => ({ value: String(w), label: t(`schedule.week.${w}`) }))}
                  value={String(trigger.weekOfMonth ?? 1)}
                  onChange={(v) => onTrigger({ weekOfMonth: Number(v) })}
                  placeholder={t("schedule.week.1")}
                  emptyLabel={t("common.noResults")}
                  ariaLabel={t("schedule.whichWeek")}
                />
                <WeekdayButtons single label={t("schedule.weekday")} value={trigger.weekdays ?? []} onChange={(weekdays) => onTrigger({ weekdays })} />
              </Indented>
            )}
          </RadioGroup>
        </Field>
      )}

      {frequency === "QUARTERLY" && (
        <>
          <Field label={t("schedule.monthOfQuarter")} error={err("monthOfPeriod")}>
            <SegmentedControl<"1" | "2" | "3">
              size="window"
              aria-label={t("schedule.monthOfQuarter")}
              value={String(trigger.monthOfPeriod ?? 1) as "1" | "2" | "3"}
              onChange={(v) => onTrigger({ monthOfPeriod: Number(v) })}
              options={(["1", "2", "3"] as const).map((m) => ({ value: m, label: t(`schedule.quarterMonth.${m}`) }))}
            />
          </Field>
          <Field label={t("schedule.day")} error={err("dayOfMonth")} hint={quarterHint}>
            <DayGrid label={t("schedule.dayOfMonth")} value={trigger.dayOfMonth} onChange={(dayOfMonth) => onTrigger({ dayOfMonth })} />
          </Field>
        </>
      )}

      {frequency === "YEARLY" && (
        <Field label={t("schedule.on")} error={err("monthOfPeriod") ?? err("dayOfMonth")}>
          <YearDateField
            label={t("schedule.on")}
            month={trigger.monthOfPeriod ?? 1}
            day={trigger.dayOfMonth ?? 1}
            onChange={(monthOfPeriod, dayOfMonth) => onTrigger({ monthOfPeriod, dayOfMonth })}
          />
        </Field>
      )}

      <Field label={t("schedule.at")} error={err("at")}>
        <TimeInput value={trigger.at ?? "09:00"} onChange={(at) => onTrigger({ at })} aria-label={t("schedule.at")} />
      </Field>

      {/* C26: no hint under the time zone; C32: three options on two lines each, no search. */}
      <Field label={t("schedule.timeZone")} error={err("timeZone")}>
        <div className="flex flex-col gap-2">
          <CompactPick
            size="md"
            searchable={false}
            options={(["PERSON", "COMPANY", "PICK"] as const).map((m) => ({
              value: m,
              label: t(`schedule.zone.${m}`),
              hint: zoneLines[m],
              separatorBefore: m === "PICK",
            }))}
            value={zoneMode}
            onChange={(m) => onTrigger({ timeZone: m === "PICK" ? Intl.DateTimeFormat().resolvedOptions().timeZone : m })}
            placeholder={t("schedule.zone.PERSON")}
            emptyLabel={t("common.noResults")}
            ariaLabel={t("schedule.timeZone")}
          />
          {zoneMode === "PICK" && (
            <SearchableSelect
              options={zones}
              value={zone}
              onChange={(v) => v && onTrigger({ timeZone: v })}
              clearable={false}
              aria-label={t("schedule.pickZone")}
              emptyLabel={t("schedule.noZones")}
            />
          )}
        </div>
      </Field>
    </FieldStack>
  );
};
