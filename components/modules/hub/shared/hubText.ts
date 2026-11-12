"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { formatDisplayDate, useDisplayLanguage, useDisplayLocale, useShortDates } from "@/lib/date";
import type { AudienceLabel } from "@/models/hub";

/**
 * An audience label from the backend — `"EVERYONE"` or a count of people — in words: "Everyone at Acme",
 * "118 people". The backend never sends words (they would be in its language, not the reader's).
 */
export const useAudienceLabel = () => {
  const t = useTranslations("hub");
  const { company } = useCompanyData();
  return useCallback(
    (label: AudienceLabel | null | undefined): string => {
      if (!label || label === "EVERYONE") return t("audience.everyoneAt", { company: company?.name ?? "" });
      const count = Number(label);
      return Number.isFinite(count) ? t("audience.people", { count }) : label;
    },
    [t, company?.name],
  );
};

/** The company's name, for "Everyone at {company}". */
export const useCompanyName = (): string => useCompanyData().company?.name ?? "";

/**
 * The hub's dates, in the page's language: `short` is "12 Nov" this year and "12 Nov 2025" otherwise (CH01);
 * `long` always has its year (CP02's "updated 3 Nov 2026"); `time` is "9:00".
 */
export const useHubDates = () => {
  const short = useShortDates();
  const language = useDisplayLanguage();
  const locale = useDisplayLocale();
  return {
    short: (value: string | null | undefined) => short.date(value ?? null),
    long: (value: string | null | undefined) => formatDisplayDate(value ?? null, { style: "medium", language }),
    time: (value: string | null | undefined) => {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
    },
    month: (value: string | null | undefined) => {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
    },
    monthYear: (value: string | null | undefined) => {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
    },
  };
};

/** A count on the agree call-out: up to 99, then "99+" (CH01 Long content). */
export const capCount = (n: number): string => (n > 99 ? "99+" : String(n));

/** The first word of a name: "Anna" of "Anna Petrova". */
export const firstNameOf = (name: string | null | undefined): string => (name ?? "").trim().split(/\s+/)[0] ?? "";
