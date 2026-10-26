/**
 * Who gets which holiday calendar (PUBLIC_HOLIDAYS.md § "Who gets which calendar"): a calendar bound to an
 * office, a legal entity or the company default reaches everybody who works there through a live rule of
 * the automation engine. Mirrors `HolidayCalendarBindingDTOs` and `AutomationDTOs.BindingRef` in Java.
 */
import type { PersonRef } from "@/models/automations";

/** Also the precedence: the office over the legal entity over the company default. */
export type HolidayCalendarBindingKind = "OFFICE" | "LEGAL_ENTITY" | "COMPANY_DEFAULT";

/** "Office Berlin → Germany 2026". */
export type HolidayCalendarBindingRef = {
  kind: HolidayCalendarBindingKind;
  /** The office or legal entity; null for the company default. */
  refId: string | null;
  name: string | null;
  calendarId: string | null;
  calendarName: string | null;
};

/** The Holiday Calendar field as it stands. */
export type HolidayCalendarBinding = {
  kind: HolidayCalendarBindingKind;
  refId: string | null;
  refName: string | null;
  /** Null when nothing is bound. */
  calendarId: string | null;
  calendarName: string | null;
  /** The binding's live rule — its run log is the field's history. */
  ruleId: string | null;
  ruleName: string | null;
  ruleStatus: "DISABLED" | "ENABLED" | "PAUSED" | "ARCHIVED" | null;
  /** How many people inherit their calendar from this binding now. */
  inheriting: number;
};

export type HolidayCalendarBindingRequest = {
  kind: HolidayCalendarBindingKind;
  refId: string | null;
  /** Null clears the field. */
  calendarId: string | null;
};

/** What setting the field would do, counted before anything is written. */
export type HolidayCalendarBindingPreview = {
  kind: HolidayCalendarBindingKind;
  refId: string | null;
  calendarId: string | null;
  calendarName: string | null;
  currentRuleId: string | null;
  members: number;
  /** No own calendar: they will inherit it (including `unchanged`). */
  willInherit: number;
  unchanged: number;
  /** Their own calendar is exactly this one: it is handed to the binding. */
  alreadyByHand: number;
  /** Another own calendar: it stays, as an override. */
  keepOwn: number;
  /** A more specific binding reaches them — their office's, over a legal entity's or the default. */
  outranked: number;
  /** Clearing only: who inherits from this binding now and falls back to the next one down. */
  losing: number;
  keepOwnPeople: PersonRef[];
  outrankedPeople: PersonRef[];
};

export * from "./labels";
