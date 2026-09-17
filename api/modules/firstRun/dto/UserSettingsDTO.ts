/** One person's own preferences. Mirrors `UserSettingsDTO` on the backend. */
export type UserDateFormat = "SYSTEM" | "DMY" | "MDY" | "YMD";
export type UserTimeFormat = "SYSTEM" | "H24" | "H12";

export type UserSettingsDTO = {
  /** null means "follow the company", which is a choice and not an absence. */
  timeZone: string | null;
  /** Which zone that currently is, so a screen can name it without a second call. */
  companyTimeZone: string;
  dateFormat: UserDateFormat;
  timeFormat: UserTimeFormat;
  language: string | null;
  welcomeCompletedAt: string | null;
};

export type UpdateUserSettingsRequest = {
  timeZone?: string | null;
  /** null on `timeZone` means "leave it alone"; this is how "follow the company" is said. */
  clearTimeZone?: boolean;
  dateFormat?: UserDateFormat;
  timeFormat?: UserTimeFormat;
  language?: string | null;
};
