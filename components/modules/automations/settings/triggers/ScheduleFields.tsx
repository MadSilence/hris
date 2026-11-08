"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { partsToISO, useDisplayLocale, useShortDates } from "@/lib/date";
import type { ScheduleFrequency, TriggerSpec } from "@/models/automations";
import { cn } from "@/lib/cn";
import { CompactPick } from "../conditions/chrome";
import { Field, FieldStack, Hint, Indented, PartDivider, TimeInput } from "../parts/parts";
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

const dayButton = (picked: boolean) =>
  cn(
    "inline-flex h-8 min-w-8 items-center justify-center rounded-control border text-label tabular-nums",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    picked ? "border-accent bg-accent text-on-accent" : "border-field bg-card text-primary hover:border-strong hover:bg-subtle",
  );

/** One day of the month, or the last (0): a grid of 7 columns, gap 4, 32 × 32 buttons. */
const DayGrid: React.FC<{ value: number | null | undefined; onChange: (day: number) => void; max?: number; lastDay?: boolean; label: string }> = ({
  value,
  onChange,
  max = 31,
  lastDay = true,
  label,
}) => {
  const t = useTranslations("automationsSettings");
  return (
    <div role="group" aria-label={label} className="grid grid-cols-7 gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((d) => (
        <button key={d} type="button" aria-pressed={value === d} onClick={() => onChange(d)} className={dayButton(value === d)}>
          {d}
        </button>
      ))}
      {lastDay && (
        <button type="button" aria-pressed={value === 0} onClick={() => onChange(0)} className={cn(dayButton(value === 0), "col-span-3 px-2")}>
          {t("schedule.lastDay")}
        </button>
      )}
    </div>
  );
};

/** Mo–Su: several (a week) or one (a month's weekday). */
const WeekdayButtons: React.FC<{ value: number[]; onChange: (days: number[]) => void; single?: boolean; label: string }> = ({
  value,
  onChange,
  single = false,
  label,
}) => {
  const tA = useTranslations("automations");
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {WEEKDAYS.map((d: Weekday) => {
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
            className={cn(dayButton(picked), "flex-1")}
          >
            {tA(`weekdayShort.${d}`)}
          </button>
        );
      })}
    </div>
  );
};

/** Month names in the page's language, January first. */
const useMonthNames = (style: "long" | "short") => {
  const locale = useDisplayLocale();
  return React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: style });
    return Array.from({ length: 12 }, (_, m) => f.format(new Date(2024, m, 1)));
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
  const year = new Date().getFullYear();
  // The month's length in this year, not in a leap one: 31 in a quarter's second month is 28 February in 2026, and
  // counted against 2024's 29 it rolled over to "1 Mar" (walk of 2026-11-07).
  const dates = months.map((m) => short.date(partsToISO(year, m, Math.min(day, new Date(year, m + 1, 0).getDate()))));
  return t("schedule.quarterHint", { dates: list.format(dates) });
};

/**
 * Schedule (T4a–T4d): every day, week, month, quarter or year; for a week its days, for a month a day or a weekday,
 * for a quarter its month and day, for a year a month and day without a year; then the time and the time zone.
 */
export const ScheduleFields: React.FC<TriggerPartProps> = ({ trigger, problems, onTrigger }) => {
  const t = useTranslations("automationsSettings");
  const everyId = React.useId();
  const frequency = trigger.frequency ?? "MONTHLY";
  const monthNames = useMonthNames("long");
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
              aria-label={t("schedule.monthOfQuarter")}
              value={String(trigger.monthOfPeriod ?? 1) as "1" | "2" | "3"}
              onChange={(v) => onTrigger({ monthOfPeriod: Number(v) })}
              options={(["1", "2", "3"] as const).map((m) => ({ value: m, label: t(`schedule.quarterMonth.${m}`) }))}
            />
          </Field>
          <Field error={err("dayOfMonth")} hint={quarterHint}>
            <DayGrid label={t("schedule.dayOfMonth")} value={trigger.dayOfMonth} onChange={(dayOfMonth) => onTrigger({ dayOfMonth })} />
          </Field>
        </>
      )}

      {frequency === "YEARLY" && (
        <Field label={t("schedule.on")} error={err("monthOfPeriod") ?? err("dayOfMonth")} hint={t("schedule.yearHint")}>
          <div className="flex flex-col gap-2">
            <CompactPick
              size="md"
              options={monthNames.map((name, i) => ({ value: String(i + 1), label: name }))}
              value={String(trigger.monthOfPeriod ?? 1)}
              onChange={(v) => {
                const month = Number(v);
                onTrigger({ monthOfPeriod: month, dayOfMonth: Math.min(trigger.dayOfMonth || 1, daysIn(month)) });
              }}
              placeholder={monthNames[0]}
              emptyLabel={t("common.noResults")}
              ariaLabel={t("schedule.month")}
            />
            <DayGrid
              label={t("schedule.dayOfMonth")}
              lastDay={false}
              max={daysIn(trigger.monthOfPeriod ?? 1)}
              value={trigger.dayOfMonth}
              onChange={(dayOfMonth) => onTrigger({ dayOfMonth })}
            />
          </div>
        </Field>
      )}

      <PartDivider />

      <Field label={t("schedule.at")} error={err("at")}>
        <TimeInput value={trigger.at ?? "09:00"} onChange={(at) => onTrigger({ at })} aria-label={t("schedule.at")} />
      </Field>

      <Field label={t("schedule.timeZone")} error={err("timeZone")} hint={t(`schedule.zoneHint.${zoneMode}`)}>
        <div className="flex flex-col gap-2">
          <CompactPick
            size="md"
            options={(["PERSON", "COMPANY", "PICK"] as const).map((m) => ({ value: m, label: t(`schedule.zone.${m}`) }))}
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
