import { AttributeType } from "@/models/attribute";

export type OptionDTO = {
  id: string;
  // What a filter on this field matches against.
  value: string;
  // Display text when it differs from `value` — enum-like system fields store a code
  // ("FULL_TIME") but read as "Full-time". Absent for attribute options.
  label?: string | null;
};

export type FieldDTO = {
  id: string;
  key: string;
  label: string;
  type: AttributeType;
  isSystem: boolean;
  // Sensitive custom attribute: never auto-granted, and masked for anyone without VIEW.
  sensitive?: boolean;
  // The calling user's own level on this field — not the configuration of any role.
  level: "NONE" | "READ" | "EDIT";
  // False for locked system fields: their access cannot be restricted (PUT → RF00002).
  configurable?: boolean;
  // Scopes at which the caller can VIEW this field. Filtering/columns need "COMPANY".
  viewScopes?: string[] | null;
  options?: OptionDTO[] | null;
  // Section the field belongs to: a registry group for system fields ("Account", "Employment",
  // "Organization"), the attribute group's name for custom ones.
  group?: string | null;
  // REFERENCE only — which catalogue supplies the values, and how many a person can hold.
  valueSource?: ReferenceValueSource | null;
  cardinality?: "ONE" | "MANY" | null;
  // A field with no storage of its own names the field it is read from (`sys:level` → `sys:job`).
  // Nobody edits it directly; the screen points at the source instead.
  derivedFrom?: string | null;
};

/**
 * Catalogues a REFERENCE field can point at. These are entities with their own CRUD and their own
 * permissions, not option lists owned by the field.
 */
export type ReferenceValueSource =
  | "offices"
  | "legalEntities"
  | "jobs"
  | "levels"
  | "departments"
  | "teams"
  | "calendars"
  | "roles"
  | "people";

/** Runtime companion to {@link ReferenceValueSource} — keep both in step. */
export const REFERENCE_VALUE_SOURCES = [
  "offices",
  "legalEntities",
  "jobs",
  "levels",
  "departments",
  "teams",
  "calendars",
  "roles",
  "people",
] as const satisfies readonly ReferenceValueSource[];

export const isReferenceValueSource = (source: string): source is ReferenceValueSource =>
  (REFERENCE_VALUE_SOURCES as readonly string[]).includes(source);

export const isReferenceField = (field: FieldDTO): boolean =>
  field.type === AttributeType.REFERENCE && !!field.valueSource;

export type FilterDTO = {
  field: string;
  op:
    | "eq" | "neq" | "contains" | "starts_with"
    | "in" | "has_any"
    // Negations. `not_in` / `not_has_any` were resolved by the backend long before the UI offered
    // them; see DECISIONS.md "The filter UI must offer what the engine supports".
    | "not_in" | "not_has_any"
    | "before" | "after" | "between"
    // Numeric comparison/range — backend attr:* NUMBER columns (int_value/dec_value).
    | "gt" | "gte" | "lt" | "lte";
  value?: string | null;
  valueTo?: string | null;
  values?: string[] | null;
  /**
   * Negative operators only. By default "is not X" skips people who have no value at all; set this
   * to include them. Silence would otherwise widen the set, which matters most when the same filter
   * defines an access scope.
   */
  includeEmpty?: boolean | null;
};

export type UsersSearchRequest = {
  limit?: number;
  cursor?: string | null;
  q?: string | null;
  sortField?: string | null;
  sortDir?: "asc" | "desc" | null;
  selectedFields?: string[] | null;
  filters?: FilterDTO[] | null;
  /** See {@link DraftVisibility}. Omitted means EXCLUDE — the employees, as before. */
  drafts?: DraftVisibility | null;
};

/**
 * Where people nobody has started yet stand in a people query.
 *
 * A draft has no account and no employment, so it is out of every list by default. `ONLY` is the
 * directory's own Drafts segment — a view, not a filter — and `INCLUDE` is the "assign to" picker,
 * where a draft can be set up before their first day. The backend honours anything but `EXCLUDE`
 * only for a caller who may edit people company-wide, because a narrower scope cannot reach
 * somebody who is in no department, team or office.
 */
export type DraftVisibility = "EXCLUDE" | "INCLUDE" | "ONLY";

export type UserRoleDTO = {
  id: string;
  name: string;
}

// Lightweight reference to an org entity — id + name only, not the full object.
// Follow the id to the entity's own endpoint for details.
export type RefDTO = {
  id: string;
  name: string;
};

/** A holiday calendar is a place ("Germany"), so there is no year to show beside the name. */
export type CalendarRefDTO = RefDTO;

/**
 * A reference to a person rather than to a thing: it carries a face. Used by the manager column and
 * by PERSON attributes ("Mentor", "Buddy"), both of which render as a user chip.
 */
export type PersonRefDTO = RefDTO & {
  avatarUrl?: string | null;
};

/**
 * A row as the API returns it.
 *
 * **A missing field means "withheld", not "empty".** Directory columns answer to field access at
 * company scope — all-or-nothing per column, because hiding a value per row would make a keyset
 * page a different length for different callers. Only identity is guaranteed.
 */
export type UsersSearchItemDTO = {
  id: string;
  companyId: string;
  email?: string;
  firstName: string;
  lastName: string;
  roles?: UserRoleDTO[];
  status?: string;
  isEmailVerified?: boolean;
  // Current job held by the user (users.job_id → jobs). jobName is the resolved
  // Position label; null means no job is assigned.
  jobId?: string | null;
  jobName?: string | null;
  // Grade of that job. Derived, not stored on the person — a column and a filter, never a write.
  level?: RefDTO | null;
  // Resolved by the backend; null when the user has no avatar (fall back to initials).
  avatarUrl?: string | null;
  // Role-assignment metadata — only populated by GET /roles/{id}/users.
  assignedAt?: string | null;
  assignedByName?: string | null;
  // Org associations — references only. Cardinality matters: department/office/legalEntity
  // are single-or-null, teams/calendars are arrays (possibly empty). null → not assigned.
  department?: RefDTO | null;
  teams?: RefDTO[];
  office?: RefDTO | null;
  legalEntity?: RefDTO | null;
  calendars?: CalendarRefDTO[];
  manager?: PersonRefDTO | null;
  // Employment lifecycle columns on `users`.
  hireDate?: string | null;
  employmentType?: string | null;
  probationEnd?: string | null;
  terminationDate?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  custom?: Record<string, unknown>;
  /** The access axis — DRAFT / INVITED / ACTIVE / BLOCKED. See `models/user/status.ts`. */
  accountStatus?: string | null;
  /** When the last invitation went out; what separates INVITED from a draft. */
  inviteSentAt?: string | null;
};

export type UsersSearchResponseDTO = {
  items: UsersSearchItemDTO[];
  nextCursor?: string | null;
};
