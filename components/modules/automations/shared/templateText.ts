import type { AutomationsT } from "./vocabulary";

/**
 * The shipped templates (D3) come from the backend with English names and descriptions; the frontend knows the
 * fixed set by key and words them in the reader's language. A key or a category it does not know keeps the
 * server's text.
 */
const TEMPLATE_KEYS = {
  "welcome-email": "welcomeEmail",
  "manager-first-day": "managerFirstDay",
  "probation-review": "probationReview",
  "work-anniversary": "workAnniversary",
  birthday: "birthday",
  "document-expiry": "documentExpiry",
  "long-leave": "longLeave",
  "onboarding-done": "onboardingDone",
  "termination-hr": "terminationHr",
  "last-day-equipment": "lastDayEquipment",
  "department-move": "departmentMove",
  "monthly-details": "monthlyDetails",
  "calendar-by-office": "calendarByOffice",
} as const;

/** The categories arrive as English words; they are the code. */
const CATEGORY_KEYS = {
  Onboarding: "onboarding",
  People: "people",
  Celebrations: "celebrations",
  Compliance: "compliance",
  "Time off": "timeOff",
  Offboarding: "offboarding",
} as const;

const has = <T extends object>(map: T, key: string): key is Extract<keyof T, string> =>
  Object.prototype.hasOwnProperty.call(map, key);

export const templateText = (
  t: AutomationsT,
  template: { key: string; name: string; description: string },
): { name: string; description: string } => {
  if (!has(TEMPLATE_KEYS, template.key)) return { name: template.name, description: template.description };
  const id = TEMPLATE_KEYS[template.key];
  return { name: t(`template.${id}.name`), description: t(`template.${id}.description`) };
};

export const templateCategoryText = (t: AutomationsT, category: string): string =>
  has(CATEGORY_KEYS, category) ? t(`templateCategory.${CATEGORY_KEYS[category]}`) : category;
