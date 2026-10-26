export type CompanyDTO = {
  id: string;
  name: string;
  subdomain: string;
  companyLogo: string | null;
  description: string | null;
  website: string | null;
  /** See `models/company/Company.ts` for why the working week rides on the app-shell read. */
  workingDays?: string[];
  weekStartDay?: string;
  /** The company row's version — the profile fields only; the working week has its own, on settings. */
  version?: number;
};

export type CompanySettingsDTO = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
  dailyNormMinutes?: number;
  attendanceRateAttributeId?: string | null;
  /** 0 for a company whose settings row has not been written yet. */
  version?: number;
};

export type UpdateCompanyRequest = {
  name: string;
  description: string | null;
  website: string | null;
  /** The version the form was opened with; a stale one is refused with E00409. */
  version?: number;
};

export type UpdateCompanySettingsRequest = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
  /** Minutes in a company working day. Left out, the stored value stays — the Company form does not carry it. */
  dailyNormMinutes?: number | null;
  /**
   * The MONEY field Attendance prices logged time from. Left out, the stored choice stays — the Company
   * form does not carry it; `{ attributeId: null }` means no money in Attendance.
   */
  attendanceRate?: { attributeId: string | null } | null;
  /** The version the form was opened with; a stale one is refused with E00409. */
  version?: number;
};
