import type { AssignableType } from "@/models/automations";

/**
 * The module path each assignment surface talks to, and the assignable type the engine knows it by.
 * The modal speaks module paths (`/offices/{id}/assignments/apply`); the live rules, the history and
 * the provenance speak types (`OFFICE`). One map, so the two never disagree.
 */
export const ASSIGNABLE_TYPE_BY_BASE_PATH: Record<string, AssignableType> = {
  "/roles": "ROLE",
  "/time-off/policies": "TIME_OFF_POLICY",
  "/teams": "TEAM",
  "/departments": "DEPARTMENT",
  "/legal-entities": "LEGAL_ENTITY",
  "/offices": "OFFICE",
  "/jobs": "JOB",
  "/public-holiday-calendars": "PUBLIC_HOLIDAY_CALENDAR",
};

export const assignableTypeOf = (basePath: string): AssignableType | undefined => ASSIGNABLE_TYPE_BY_BASE_PATH[basePath];
