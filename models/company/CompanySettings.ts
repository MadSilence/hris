/** Localization & time settings for a company. Days are java.time.DayOfWeek names (MONDAY…SUNDAY). */
export type CompanySettings = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
  /** Minutes in a company working day — Attendance's norm for anybody without a personal schedule. */
  dailyNormMinutes?: number;
  /** The MONEY field Attendance prices logged time from. Null: no money in Attendance. */
  attendanceRateAttributeId?: string | null;
  /** Sent back by the settings form. 0 while the company has no settings row yet. */
  version?: number;
};
