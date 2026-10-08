"use client";

import { useMemo } from "react";
import { useUrlState } from "@/components/utils/useUrlState/useUrlState";
import { dateToISO } from "@/lib/date";
import type { AttendancePeriod } from "@/models/attendance";
import type { FilterDTO } from "@/models/user/fields";
import { monthOf, monthPeriod } from "@/components/modules/attendance/lib";

/**
 * What the Attendance overview is looking at — a month or a picked range, the search and the filters —
 * held in the URL, so coming back from a person lands on the same view and a link reproduces it.
 *
 * `month=yyyy-MM`, or `from` and `to` for a range; neither means the current month. The current
 * month counts expected days to today, a range to its end (`monthPeriod`).
 */
export type AttendanceView = {
  month: string;
  range: { start: string; end: string } | null;
  period: AttendancePeriod;
  query: string;
  filters: FilterDTO[];
  /** The query string that reproduces this view — carried to a person's page and back. */
  search: string;
};

const readFilters = (raw: string | null): FilterDTO[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FilterDTO[]) : [];
  } catch {
    return [];
  }
};

/** Reads the view from query params — the overview and the person page share it. */
export const viewFromParams = (params: URLSearchParams, today: string): AttendanceView => {
  const from = params.get("from");
  const to = params.get("to");
  const range = from && to && from <= to ? { start: from, end: to } : null;
  const monthParam = params.get("month");
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : monthOf(range?.start ?? today);
  const period: AttendancePeriod = range
    ? { from: range.start, to: range.end, expectedUntil: null }
    : monthPeriod(month, today);
  return {
    month,
    range,
    period,
    query: params.get("q") ?? "",
    filters: readFilters(params.get("filters")),
    search: params.toString(),
  };
};

export const useAttendanceView = () => {
  const { params, setParams } = useUrlState();
  // The browser's today. The company's is a zone away at most, and only at midnight.
  const today = useMemo(() => dateToISO(new Date()), []);
  const view = useMemo(() => viewFromParams(new URLSearchParams(params.toString()), today), [params, today]);

  return {
    view,
    today,
    setMonth: (month: string) => setParams({ month, from: null, to: null }),
    setRange: (range: { start: string; end: string } | null) =>
      setParams(range ? { from: range.start, to: range.end, month: null } : { from: null, to: null }),
    setQuery: (q: string) => setParams({ q }),
    setFilters: (filters: FilterDTO[]) => setParams({ filters: filters.length ? JSON.stringify(filters) : null }),
  };
};
