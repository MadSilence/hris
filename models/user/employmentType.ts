/**
 * The employment-type vocabulary the backend accepts (`FieldRegistry` sys:employment_type, enforced
 * in `BulkEditService`). Kept in one place so the bulk-edit picker and the profile agree.
 */
export const EMPLOYMENT_TYPES = [
  { id: "FULL_TIME", label: "Full-time" },
  { id: "PART_TIME", label: "Part-time" },
  { id: "CONTRACTOR", label: "Contractor" },
  { id: "INTERN", label: "Intern" },
  { id: "TEMPORARY", label: "Temporary" },
] as const;

export type EmploymentTypeId = (typeof EMPLOYMENT_TYPES)[number]["id"];

export function formatEmploymentType(value?: string | null): string | null {
  if (!value) return null;
  return EMPLOYMENT_TYPES.find((t) => t.id === value)?.label ?? value;
}
