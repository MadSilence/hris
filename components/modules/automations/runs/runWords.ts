"use client";

import { useMessages, useTranslations } from "next-intl";
import { dateToISO, useDisplayLocale, useShortDates } from "@/lib/date";
import type { AutomationRun, AutomationRunStatus } from "@/models/automations";
import type { Messages } from "@/i18n/messages";

type ReasonCode = keyof Messages["automations"]["reason"];

/**
 * A reason as the backend stores it: a code, optionally followed by `: detail` — `NO_APPROVER: nobody to approve this
 * for Anna`. The code picks the sentence; the detail is the backend's own English, written for whoever debugs it.
 */
export const parseReason = (reason: string | null | undefined): { code: string; detail: string | null } | null => {
  if (!reason || !reason.trim()) return null;
  const at = reason.indexOf(":");
  if (at < 0) return { code: reason.trim(), detail: null };
  const detail = reason.slice(at + 1).trim();
  return { code: reason.slice(0, at).trim(), detail: detail || null };
};

/**
 * A moment from the backend: a `LocalDateTime` is UTC wall-clock with no zone suffix (`hris-api/CLAUDE.md` § "Time
 * and dates"), which `new Date` would read as local time — the same reading as `models/automations/moment.ts`.
 */
export const toInstant = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const str = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value : null);
const num = (value: unknown): number | null => {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** An avatar's letters: "Lena Kowalska" → "LK". */
export const initialsOf = (name: string | null | undefined): string =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** The day a run row shows under its status: the next date of one still to come, else when it finished or began. */
export const runDay = (run: AutomationRun): string | null =>
  run.status === "SCHEDULED" && run.nextDate ? run.nextDate : run.finishedAt ?? run.createdAt;

/**
 * The words of runs, shared by Run history, the run window, Activity and the profile.
 *
 *   status(s)    "Failed"
 *   about(run)   a row's second line: "Vacation, 9–27 Dec", a process's name, "A related date comes up · 4 Nov"
 *   title(run)   the run window's title: "Lena Kowalska, Vacation"
 *   late(run)    "Ran 2 days late", or null
 *   reason(r)    a reason as a sentence, "what happened, then why"; null for none
 *   day(v)       "Today", "Yesterday", "4 Nov"
 *   moment(v)    "Today, 14:20", "3 Nov, 10:14"
 *   recent(v)    "Today, 14:20" or "28 Oct"
 *   time(v)      "10:14"
 */
export const useRunWords = () => {
  const t = useTranslations("automations");
  const tr = useTranslations("automationsRuns");
  const reasons = useMessages().automations.reason as Record<string, string>;
  const dates = useShortDates();
  const locale = useDisplayLocale();

  const time = (value: string | Date | null | undefined, withZone = false): string => {
    const date = value instanceof Date ? value : toInstant(value);
    if (!date) return "";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      ...(withZone ? { timeZoneName: "short" as const } : {}),
    }).format(date);
  };

  const relative = (date: Date): "today" | "yesterday" | null => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const iso = dateToISO(date);
    if (iso === dateToISO(today)) return "today";
    if (iso === dateToISO(yesterday)) return "yesterday";
    return null;
  };

  const day = (value: string | null | undefined): string => {
    const date = toInstant(value);
    if (!date) return "";
    const near = relative(date);
    if (near === "today") return tr("row.today");
    if (near === "yesterday") return tr("row.yesterday");
    return dates.date(date);
  };

  const moment = (value: string | null | undefined, withZone = false): string => {
    const date = toInstant(value);
    if (!date) return "";
    const at = time(date, withZone);
    const near = relative(date);
    if (near === "today") return tr("row.todayAt", { time: at });
    if (near === "yesterday") return tr("row.yesterdayAt", { time: at });
    return tr("row.dateAt", { date: dates.date(date), time: at });
  };

  /** "Today, 14:20" for today and yesterday, the bare day before that: "28 Oct". */
  const recent = (value: string | null | undefined): string => {
    const date = toInstant(value);
    if (!date) return "";
    return relative(date) ? moment(value) : dates.date(date);
  };

  const status = (s: AutomationRunStatus): string => t(`runStatus.${s}`);

  const about = (run: AutomationRun): string => {
    const a = run.about ?? {};
    const kind = str(a.kind);
    if (kind === "TIME_OFF") {
      const type = str(a.leaveType) ?? tr("row.timeOff");
      const start = str(a.start);
      if (start) return tr("row.timeOffDates", { type, dates: dates.range(start, str(a.end)) });
      const days = num(a.days);
      return days != null ? tr("row.timeOffDays", { type, count: days }) : type;
    }
    if (kind === "PROCESS") return str(a.name) ?? str(a.processType) ?? "";
    const anchor = str(a.anchorDate);
    // The trigger and its date, as the Activity spec's "Built" says ("Probation ends · 25 Nov"); "Counted from 7 Nov"
    // read as if a step were meant (walk of 2026-11-07).
    if (anchor) return tr("row.triggerOn", { trigger: t(`trigger.${run.triggerType === "EVENT" ? "TIME_OFF_REQUESTED" : run.triggerType}`), date: dates.date(anchor) });
    const fired = str(a.date);
    if (fired) return tr("row.firedOn", { date: dates.date(fired) });
    return t(`trigger.${run.triggerType === "EVENT" ? "TIME_OFF_REQUESTED" : run.triggerType}`);
  };

  const title = (run: AutomationRun): string => {
    const name = run.person?.name ?? tr("row.unknownPerson");
    const a = run.about ?? {};
    const what = str(a.kind) === "TIME_OFF" ? str(a.leaveType) ?? tr("row.timeOff") : about(run);
    return what ? tr("row.title", { name, what }) : name;
  };

  const late = (run: Pick<AutomationRun, "ranLate" | "daysLate">): string | null => {
    if (run.daysLate > 0) return tr("row.late", { count: run.daysLate });
    return run.ranLate ? tr("row.lateNoDays") : null;
  };

  const reason = (value: string | null | undefined): string | null => {
    const parsed = parseReason(value);
    if (!parsed) return null;
    const code = (parsed.code in reasons ? parsed.code : "UNKNOWN") as ReasonCode;
    return t(`reason.${code}`);
  };

  return { status, about, title, late, reason, day, moment, recent, time };
};

export type RunWords = ReturnType<typeof useRunWords>;
