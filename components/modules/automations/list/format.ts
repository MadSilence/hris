"use client";

import { useTranslations } from "next-intl";
import { formatShortDate, useDisplayLanguage, useDisplayLocale } from "@/lib/date";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Whole days from `then` to `now`, counted in calendar days of the reader's clock. */
export const daysBetween = (then: Date, now: Date): number =>
  Math.round((startOfDay(now).getTime() - startOfDay(then).getTime()) / DAY_MS);

/**
 * "today, 09:00" · "yesterday, 16:20" · "4 Nov" · "4 Nov 2025": when something happened or will happen, for a card's
 * footer (lowercase, inside a sentence) and Activity's When column (capitalised, standing alone).
 */
export const useWhen = () => {
  const t = useTranslations("automationsList");
  const language = useDisplayLanguage();
  const locale = useDisplayLocale();
  return (value: string | null | undefined, standalone = false, now: Date = new Date()): string => {
    if (!value) return "";
    const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    // A moment without a zone is the backend's UTC wall clock (`models/automations/moment.ts`); read as local time it
    // put Activity's When an offset away from the run window's "started" (walk of 2026-11-12).
    const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value.trim());
    const date = new Date(hasTime && !hasZone ? `${value.trim()}Z` : value);
    if (Number.isNaN(date.getTime())) return "";
    const days = daysBetween(date, now);
    if (hasTime && (days === 0 || days === 1)) {
      const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
      if (days === 0) return standalone ? t("when.Today", { time }) : t("when.today", { time });
      return standalone ? t("when.Yesterday", { time }) : t("when.yesterday", { time });
    }
    return formatShortDate(hasTime ? date : value, { language, today: now });
  };
};

/** A count as people write it — "1,284". */
export const useCount = () => {
  const locale = useDisplayLocale();
  return (value: number) => new Intl.NumberFormat(locale).format(value);
};
