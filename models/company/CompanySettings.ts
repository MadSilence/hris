/** Localization & time settings for a company. Days are java.time.DayOfWeek names (MONDAY…SUNDAY). */
export type CompanySettings = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
};
