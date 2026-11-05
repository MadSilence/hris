/**
 * The employment-type vocabulary the backend accepts (`FieldRegistry` sys:employment_type, enforced
 * in `BulkEditService`). Kept in one place so the bulk-edit picker and the profile agree.
 */
export const EMPLOYMENT_TYPES = [
  { id: "FULL_TIME", labelKey: "employmentType.fullTime" },
  { id: "PART_TIME", labelKey: "employmentType.partTime" },
  { id: "CONTRACTOR", labelKey: "employmentType.contractor" },
  { id: "INTERN", labelKey: "employmentType.intern" },
  { id: "TEMPORARY", labelKey: "employmentType.temporary" },
] as const;

export type EmploymentTypeId = (typeof EMPLOYMENT_TYPES)[number]["id"];

type OrganizationT = (key: (typeof EMPLOYMENT_TYPES)[number]["labelKey"]) => string;

/** The type's label in the reader's language; an unknown stored value is shown as it is. */
export function formatEmploymentType(t: OrganizationT, value?: string | null): string | null {
  if (!value) return null;
  const type = EMPLOYMENT_TYPES.find((e) => e.id === value);
  return type ? t(type.labelKey) : value;
}
