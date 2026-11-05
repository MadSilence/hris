import type { HomeWidgetPlacement } from "@/models/home";

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
  /** The person's own language; null means "follow the company" (I18N.md § 5). */
  language: string | null;
  /** The company's language, beside it so one read resolves the locale. */
  companyLanguage: string;
  welcomeCompletedAt: string | null;
  /** "Delegate my approvals while I'm on leave" — on unless switched off. */
  delegateApprovalsOnLeave: boolean;
  /** How this person arranged their home, in their order; empty is the default arrangement. */
  homeLayout: HomeWidgetPlacement[];
};

export type UpdateUserSettingsRequest = {
  timeZone?: string | null;
  /** null on `timeZone` means "leave it alone"; this is how "follow the company" is said. */
  clearTimeZone?: boolean;
  dateFormat?: UserDateFormat;
  timeFormat?: UserTimeFormat;
  language?: string | null;
  delegateApprovalsOnLeave?: boolean;
  /** The whole arrangement of home; an empty list goes back to the default. */
  homeLayout?: HomeWidgetPlacement[];
};
