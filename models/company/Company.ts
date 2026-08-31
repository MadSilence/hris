export type Company = {
  id: string;
  name: string;
  subdomain: string;
  companyLogo: string | null;
  description: string | null;
  website: string | null;

  /**
   * The company's working week, e.g. `["MONDAY", …, "FRIDAY"]`.
   *
   * On the app-shell payload rather than behind `GET /company/settings`, which needs
   * `SETTINGS.GENERAL VIEW`. Which days the company works is not an administration fact — every
   * calendar has to shade non-working days, and gating it behind a settings right is what left the
   * board hardcoding Saturday and Sunday.
   *
   * Optional because the provider can be mid-flight; callers fall back to Mon–Fri.
   */
  workingDays?: string[];
  weekStartDay?: string;
};
