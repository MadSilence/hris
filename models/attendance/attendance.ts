/**
 * The timesheet, as the backend sends it (`hris-api` `features/attendance`).
 *
 * Hours only. The amount owed needs an hourly rate, and where a rate comes from is an open question
 * (`NEED_TO_DISCUSS.md` § 24), so nothing here is money.
 *
 * Hours travel as JSON numbers (Java `BigDecimal`), dates as `yyyy-MM-dd`.
 */

export type AttendanceSource = "WEB" | "MANUAL" | "IMPORT";

export type AttendanceEntry = {
  id: string;
  userId: string;
  workDate: string;
  hours: number;
  description: string | null;
  source: AttendanceSource;
};

export type AttendanceDay = {
  date: string;
  /** The person's schedule (or the company week) has hours this weekday, and it is no holiday of theirs. */
  workingDay: boolean;
  /** The norm from the person's own schedule; `null` when only the company week applies — it gives days, not hours. */
  scheduledHours: number | null;
  /** The public holiday on this day, when there is one. */
  holiday: string | null;
  /** Approved leave holds this day. Only the fact — the policy and the reason stay with Time Off. */
  onLeave: boolean;
  hours: number | null;
  description: string | null;
  source: AttendanceSource | null;
  /** Hours recorded on a day of leave — possible only when the leave was approved afterwards. */
  conflict: boolean;
};

export type AttendanceSummary = {
  recordedHours: number;
  daysRecorded: number;
  workingDays: number;
  leaveDays: number;
  missingDays: number;
  /** `null` when any expected day has no known norm. */
  scheduledHours: number | null;
};

export type AttendanceMonth = {
  userId: string;
  /** `yyyy-MM`. */
  month: string;
  /** The company's today — not the browser's. */
  today: string;
  days: AttendanceDay[];
  summary: AttendanceSummary;
};

/** What the caller may do on one person's timesheet and schedule — the server's answer, not a guess. */
export type AttendanceCapabilities = {
  canView: boolean;
  canRecord: boolean;
  canViewOthers: boolean;
  canExport: boolean;
  canViewSchedule: boolean;
  canEditSchedule: boolean;
};

export type RecordAttendanceDayRequest = {
  hours: number;
  description?: string | null;
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

/** Exactly one target per export. */
export type AttendanceExportTarget =
  | { type: "person"; userId: string }
  | { type: "team"; teamId: string }
  | { type: "department"; departmentId: string }
  | { type: "company" };

export const ATTENDANCE_SOURCE_LABELS: Record<AttendanceSource, string> = {
  WEB: "Recorded by the person",
  MANUAL: "Recorded by somebody else",
  IMPORT: "Imported",
};
