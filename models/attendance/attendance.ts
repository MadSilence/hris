/**
 * Attendance, as the backend sends it (`hris-api` `features/attendance`). Rebuilt 2026-09-28
 * (`(claude)/technical_documentation/ATTENDANCE.md`).
 *
 * Durations are **minutes** everywhere; the screens spell them `H:MM` (`formatMinutes`). Dates are
 * `yyyy-MM-dd`, times of day `HH:mm`. Money is the amount owed (`AttendanceTotals.amounts`), from the
 * rate snapshotted into each span when it was logged; it is absent for a reader who may not see the rate.
 */

import type { FilterDTO } from "@/models/user/fields";

/** One logged span of work on one day. */
export type AttendanceEntry = {
  id: string;
  userId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  minutes: number;
  description: string | null;
};

/** What logged time is owed at, in one currency — never converted into another. */
export type AttendanceAmount = {
  /** ISO 4217, e.g. `EUR`. */
  currency: string;
  amount: number;
};

/** A person's period in five numbers — a row of the overview, the head of the person page. */
export type AttendanceTotals = {
  expectedDays: number;
  loggedDays: number;
  expectedMinutes: number;
  loggedMinutes: number;
  overtimeMinutes: number;
  /**
   * The amount owed, one per currency. Empty: nothing in the period carries a rate. Null: the reader may
   * not see the rate field, or the company prices no time — the screens then show nothing at all.
   */
  amounts?: AttendanceAmount[] | null;
};

export type AttendanceLogDay = {
  date: string;
  /** Inside the person's employment — hire date to termination date. */
  employed: boolean;
  /** Employed, their week works this weekday, and it is not their public holiday. */
  workingDay: boolean;
  /** How long the day is expected to be. Zero on a day off, a holiday, leave or outside employment. */
  normMinutes: number;
  /** A working day, not on leave, not after the period's `expectedUntil`. */
  expected: boolean;
  holiday: string | null;
  onLeave: boolean;
  /** Expected, nothing logged, and already past. */
  missing: boolean;
  loggedMinutes: number;
  overtimeMinutes: number;
  entries: AttendanceEntry[];
};

export type AttendanceLog = {
  userId: string;
  /** Name and photo only — email and status are left out of this read. */
  person: AttendancePerson;
  from: string;
  to: string;
  expectedUntil: string;
  /** The company's today — not the browser's. */
  today: string;
  totals: AttendanceTotals;
  days: AttendanceLogDay[];
};

/** What the caller may do on one person's attendance — the server's answer, not a guess. */
export type AttendanceCapabilities = {
  canView: boolean;
  /** Only on your own timesheet: nobody logs somebody else's time. */
  canLog: boolean;
  /** The company overview, the person pages and the export. */
  canManage: boolean;
  canViewSchedule: boolean;
  canEditSchedule: boolean;
};

export type AttendanceEntryWriteRequest = {
  dates: string[];
  startTime: string;
  endTime: string;
  description?: string | null;
};

export type AttendanceEntryUpdateRequest = {
  startTime: string;
  endTime: string;
  description?: string | null;
};

export type AttendancePerson = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  /** Null when the reader may not see emails. */
  email: string | null;
  avatarUrl: string | null;
  status: string | null;
};

export type AttendanceReportRow = { person: AttendancePerson; totals: AttendanceTotals };

export type AttendanceReportPage = {
  items: AttendanceReportRow[];
  nextCursor: string | null;
  /** How many people the whole report covers — on the first page only. */
  total: number | null;
};

/** The period the overview, the person page and the export are asked about. */
export type AttendancePeriod = {
  from: string;
  to: string;
  /** The last day "expected" counts: today for the default month, absent for a picked period. */
  expectedUntil?: string | null;
};

export type AttendanceReportRequest = AttendancePeriod & {
  q?: string | null;
  filters?: FilterDTO[] | null;
  cursor?: string | null;
  limit?: number | null;
};

export type AttendanceExportRequest = AttendancePeriod & {
  q?: string | null;
  filters?: FilterDTO[] | null;
};

/** Hours per weekday, in force from a date. Zero hours: not a working day. */
export type WorkSchedule = {
  id: string;
  userId: string;
  effectiveFrom: string;
  mondayHours: number;
  tuesdayHours: number;
  wednesdayHours: number;
  thursdayHours: number;
  fridayHours: number;
  saturdayHours: number;
  sundayHours: number;
};

export type WorkScheduleWriteRequest = Omit<WorkSchedule, "id" | "userId">;

export const WEEKDAY_FIELDS = [
  { key: "mondayHours", label: "Mon" },
  { key: "tuesdayHours", label: "Tue" },
  { key: "wednesdayHours", label: "Wed" },
  { key: "thursdayHours", label: "Thu" },
  { key: "fridayHours", label: "Fri" },
  { key: "saturdayHours", label: "Sat" },
  { key: "sundayHours", label: "Sun" },
] as const;

export type WeekdayHoursKey = (typeof WEEKDAY_FIELDS)[number]["key"];

/** `7:30` — hours and minutes, the one spelling of a duration in Attendance. */
export const formatMinutes = (minutes: number): string => {
  const whole = Math.max(0, Math.round(minutes));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};
