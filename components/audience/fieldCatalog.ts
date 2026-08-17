import { isReferenceField, type FieldDTO, type FilterDTO, type ReferenceValueSource } from "@/models/user/fields";
import type { ResourceCode } from "@/models/access";

export type AudienceOperator = FilterDTO["op"];

// How the value picker sources its options.
export type AudienceValueSource =
  | "freeText"
  | "number"
  | "date"
  | "boolean"
  | "attributeOptions"
  | ReferenceValueSource;

export type AudienceFieldGroup = "Org" | "System" | "Custom";

export type AudienceField = {
  key: string;
  label: string;
  operators: AudienceOperator[];
  valueSource: AudienceValueSource;
  group: AudienceFieldGroup;
};

/** Operators that exclude rather than select — they get the "include people with no value" choice. */
const NEGATIVE_OPERATORS: ReadonlySet<AudienceOperator> = new Set<AudienceOperator>([
  "neq",
  "not_in",
  "not_has_any",
]);

export const isNegativeOperator = (op: AudienceOperator): boolean => NEGATIVE_OPERATORS.has(op);

// Operators allowed for a catalogue field, aligned 1:1 with what the backend segment engine
// (UserRepositoryImpl.appendAttrPredicate / appendSegmentPredicates) actually resolves.
// Custom attributes (attr:*) live in the EAV layer:
//   NUMBER  -> numeric columns (int_value/dec_value): comparison + range
//   DATE    -> date_value: eq + before/after/between
//   SELECT  -> option_id: eq / is-any-of
//   MULTI_SELECT -> tag table: has-any (set intersection)
//   TEXT/EMAIL/URL/STATUS -> string_value: eq/contains/is-any-of
// CHECKBOX/PERSON custom attrs are intentionally not filterable yet (see isFilterableField).
export function operatorsForField(field: FieldDTO): AudienceOperator[] {
  // References match on an entity id. What the backend resolves:
  //   FK columns (office/legal entity/job/manager) — eq, neq, in, not_in
  //   membership tables (department/team/calendar/role) — all six, including has_any
  // Offered by cardinality rather than by storage: `has_any` on a single-valued field says the
  // same thing as `in`, so it would only be a second name for one behaviour.
  if (isReferenceField(field)) {
    // No multi people-picker yet, so manager stays on the single-value operators.
    if (field.valueSource === "people") return ["eq", "neq"];

    return field.cardinality === "MANY"
      ? ["eq", "in", "has_any", "not_has_any"]
      : ["eq", "neq", "in", "not_in"];
  }

  if (!field.isSystem) {
    switch (field.type) {
      case "NUMBER":
        return ["eq", "neq", "gt", "gte", "lt", "lte", "between"];
      case "DATE":
        return ["eq", "neq", "before", "after", "between"];
      case "SELECT":
        return ["eq", "neq", "in", "not_in"];
      case "MULTI_SELECT":
        return ["has_any", "not_has_any"];
      default:
        return ["eq", "neq", "contains", "starts_with", "in", "not_in"];
    }
  }

  switch (field.type) {
    case "DATE":
      return ["eq", "neq", "before", "after", "between"];
    case "SELECT":
      return ["eq", "neq", "in", "not_in"];
    case "MULTI_SELECT":
      return ["has_any", "not_has_any"];
    default:
      return ["eq", "neq", "contains", "starts_with", "in", "not_in"];
  }
}

// Human-facing operator labels. Deliberately distinct wording for `in` vs `has_any`:
//   in       — the field's (single) value is one of the chosen options
//   has_any  — the user has at least one of the chosen options (multi-valued fields)
// so the two never read as the same thing in the UI.
export const OPERATOR_LABELS: Record<AudienceOperator, string> = {
  eq: "Is",
  neq: "Is not",
  contains: "Contains",
  starts_with: "Starts with",
  in: "Is any of",
  not_in: "Is none of",
  has_any: "Has any of",
  not_has_any: "Has none of",
  before: "Before",
  after: "After",
  between: "Between",
  gt: "Greater than",
  gte: "≥",
  lt: "Less than",
  lte: "≤",
};

// Custom CHECKBOX/PERSON attributes have no meaningful segment predicate yet, so they are
// dropped from the builder rather than offered as a filter that returns nothing.
function isFilterableField(field: FieldDTO): boolean {
  // References always resolve — the value is an entity id picked from a catalogue.
  if (isReferenceField(field)) return true;
  // A *custom* PERSON attribute matches on a user id but has no people-picker of its own, so the
  // filter could only be used by typing a raw UUID. (`sys:manager` is a REFERENCE now and does
  // have a picker, so it is no longer caught here.)
  if (field.type === "PERSON") return false;
  if (field.isSystem) return true;
  // LONG_TEXT lives in multiline_value and OBJECT is a repeatable record set — neither is read by the
  // segment engine's attr filter, so they're not filterable.
  return (
    field.type !== "CHECKBOX" &&
    field.type !== "LONG_TEXT" &&
    field.type !== "OBJECT" &&
    field.type !== "ADDRESS" &&
    field.type !== "MONEY"
  );
}

function valueSourceForField(field: FieldDTO): AudienceValueSource {
  if (isReferenceField(field)) return field.valueSource as ReferenceValueSource;

  if (!field.isSystem) {
    return field.options && field.options.length > 0 ? "attributeOptions" : "freeText";
  }

  switch (field.type) {
    case "DATE":
      return "date";
    case "NUMBER":
      return "number";
    case "CHECKBOX":
      return "boolean";
    case "SELECT":
    case "MULTI_SELECT":
      return "attributeOptions";
    default:
      return "freeText";
  }
}

/**
 * Permission required to *read the catalogue* a reference points at. Distinct from field access,
 * which answers whether you may see the value on a given person: picking "Office = Berlin" needs
 * the office list, seeing that Petya sits in Berlin needs the field. Both, not either.
 */
export const REFERENCE_RESOURCE: Partial<Record<ReferenceValueSource, ResourceCode>> = {
  departments: "ORG.DEPARTMENT",
  teams: "ORG.TEAM",
  offices: "ORG.OFFICE",
  legalEntities: "ORG.LEGAL_ENTITY",
  calendars: "ORG.PUBLIC_HOLIDAY_CALENDAR",
  jobs: "JOBS.TITLE",
  roles: "ROLES.ROLE",
  people: "PEOPLE.PROFILE",
};

const groupOf = (field: FieldDTO): AudienceFieldGroup => {
  if (isReferenceField(field)) return "Org";
  return field.isSystem ? "System" : "Custom";
};

// Builds the filterable field list for the audience builder, entirely from the server catalogue —
// there is no second hardcoded list of org fields any more.
// - Custom attributes the caller cannot view at COMPANY scope are dropped (backend rejects them
//   with SG00001, and they must not be offered).
// - A reference is dropped unless `canViewResource` says the caller can read its catalogue (no
//   JOBS.TITLE VIEW → no Job filter). Without the predicate, nothing is gated.
export function buildAudienceFields(
  fields: FieldDTO[] | undefined,
  canViewResource?: (resource: ResourceCode) => boolean,
): AudienceField[] {
  return (fields ?? [])
    .filter((field) => field.isSystem || (field.viewScopes ?? []).includes("COMPANY"))
    .filter(isFilterableField)
    .filter((field) => {
      if (!canViewResource || !isReferenceField(field)) return true;
      const resource = REFERENCE_RESOURCE[field.valueSource as ReferenceValueSource];
      return !resource || canViewResource(resource);
    })
    .map((field) => ({
      key: field.id,
      label: field.label ?? field.key,
      operators: operatorsForField(field),
      valueSource: valueSourceForField(field),
      group: groupOf(field),
    }));
}
