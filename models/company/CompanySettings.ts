/** Localization & time settings for a company. Days are java.time.DayOfWeek names (MONDAY…SUNDAY). */
export type CompanySettings = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
  /** Sent back by the settings form. 0 while the company has no settings row yet. */
  version?: number;
};
