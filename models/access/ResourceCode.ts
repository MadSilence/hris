export const RESOURCE_CODES = [
  "SETTINGS.GENERAL",
  "SETTINGS.IMPERSONATION",
  "PEOPLE.PROFILE",
  "PEOPLE.ATTRIBUTES",
  "PEOPLE.DOCUMENTS",
  "PEOPLE.DOCUMENT_CATEGORIES",
  "PEOPLE.TIME_OFF",
  "PEOPLE.TIME_OFF_POLICIES",
  "PEOPLE.CALENDAR",
  "ORG.DEPARTMENT",
  "ORG.TEAM",
  "ORG.OFFICE",
  "ORG.LEGAL_ENTITY",
  "ORG.PUBLIC_HOLIDAY_CALENDAR",
  "ORG.PUBLIC_HOLIDAY_TEMPLATE",
  "JOBS.FAMILY",
  "JOBS.LEVEL_GROUP",
  "JOBS.LEVEL",
  "JOBS.TITLE",
  "ROLES.ROLE",
  // Per-category "may mute this for myself" right. These are granted to the Default User role
  // out of the box, so they must exist here — the matrix that doesn't list them can't manage them.
  "NOTIFICATION.APPROVALS",
  "NOTIFICATION.ORG_CHANGES",
  "NOTIFICATION.REMINDERS",
  "NOTIFICATION.POLICIES",
  "NOTIFICATION.SYSTEM",
] as const;

export type ResourceCode = (typeof RESOURCE_CODES)[number];
