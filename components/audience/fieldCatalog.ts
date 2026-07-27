import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import type { ResourceCode } from "@/models/access";

export type AudienceOperator = FilterDTO["op"];

// How the value picker sources its options.
export type AudienceValueSource =
  | "freeText"
  | "number"
  | "date"
  | "boolean"
  | "attributeOptions"
  | "departments"
  | "teams"
  | "offices"
  | "legalEntities"
  | "calendars"
  | "jobs"
  | "status";

export type AudienceFieldGroup = "Org" | "System" | "Custom";

export type AudienceField = {
  key: string;
  label: string;
  operators: AudienceOperator[];
  valueSource: AudienceValueSource;
  group: AudienceFieldGroup;
};

// Organisation associations. Backend-confirmed keys and operators — these are gated by the
// PEOPLE.PROFILE resource (not field-access), so they are always offered when the tab is.
// Matching is by id, so contains/text operators are intentionally absent.
export const ORG_AUDIENCE_FIELDS: AudienceField[] = [
  { key: "sys:department", label: "Department", operators: ["eq", "in", "has_any"], valueSource: "departments", group: "Org" },
  { key: "sys:team", label: "Team", operators: ["eq", "in", "has_any"], valueSource: "teams", group: "Org" },
  { key: "sys:calendar", label: "Calendar", operators: ["eq", "in", "has_any"], valueSource: "calendars", group: "Org" },
  { key: "sys:office", label: "Office", operators: ["eq", "neq", "in"], valueSource: "offices", group: "Org" },
  { key: "sys:legal_entity", label: "Legal entity", operators: ["eq", "neq", "in"], valueSource: "legalEntities", group: "Org" },
  { key: "sys:job", label: "Job", operators: ["eq", "neq", "in"], valueSource: "jobs", group: "Org" },
  { key: "sys:status", label: "Status", operators: ["eq", "neq", "in"], valueSource: "status", group: "Org" },
];

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
  if (!field.isSystem) {
    switch (field.type) {
      case "NUMBER":
        return ["eq", "gt", "gte", "lt", "lte", "between"];
      case "DATE":
        return ["eq", "before", "after", "between"];
      case "SELECT":
      case "STATUS":
        return ["eq", "in"];
      case "MULTI_SELECT":
        return ["has_any"];
      default:
        return ["eq", "neq", "contains", "starts_with", "in"];
    }
  }

  switch (field.type) {
    case "DATE":
      return ["eq", "before", "after", "between"];
    case "SELECT":
    case "STATUS":
      return ["eq", "neq", "in"];
    case "MULTI_SELECT":
      return ["has_any"];
    default:
      return ["eq", "neq", "contains", "starts_with", "in"];
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
  has_any: "Has any of",
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
  if (field.isSystem) return true;
  return field.type !== "CHECKBOX" && field.type !== "PERSON";
}

function valueSourceForField(field: FieldDTO): AudienceValueSource {
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
    case "STATUS":
    case "MULTI_SELECT":
      return "attributeOptions";
    default:
      return "freeText";
  }
}

// Permission each org field requires to even be offered as a filter. If the caller can't
// view the underlying resource, the field is dropped from the builder entirely.
export const ORG_FIELD_RESOURCE: Record<string, ResourceCode> = {
  "sys:department": "ORG.DEPARTMENT",
  "sys:team": "ORG.TEAM",
  "sys:office": "ORG.OFFICE",
  "sys:legal_entity": "ORG.LEGAL_ENTITY",
  "sys:calendar": "ORG.PUBLIC_HOLIDAY_CALENDAR",
  "sys:job": "JOBS.TITLE",
  "sys:status": "PEOPLE.PROFILE",
};

// Builds the filterable field list for the audience builder.
// - Custom attributes the caller cannot view (level === "NONE") are dropped (backend rejects
//   them with SG00001, and they must not be offered).
// - Org fields are dropped unless `canViewResource` says the caller can see them (e.g. no
//   JOBS.TITLE VIEW → no Job filter). When the predicate is omitted, all org fields are kept
//   (callers that don't gate).
export function buildAudienceFields(
  fields: FieldDTO[] | undefined,
  canViewResource?: (resource: ResourceCode) => boolean,
): AudienceField[] {
  const orgFields = canViewResource
    ? ORG_AUDIENCE_FIELDS.filter((f) => {
        const resource = ORG_FIELD_RESOURCE[f.key];
        return !resource || canViewResource(resource);
      })
    : ORG_AUDIENCE_FIELDS;

  const userFields: AudienceField[] = (fields ?? [])
    // Filtering scans the whole company, so a custom attribute is only offerable when the
    // caller can view it at COMPANY scope (SELF/DIRECT_REPORTS-only fields aren't filterable).
    // System fields are resource-gated, not field-access gated, so they stay.
    .filter((field) => field.isSystem || (field.viewScopes ?? []).includes("COMPANY"))
    // Drop types with no working segment predicate (custom CHECKBOX/PERSON).
    .filter(isFilterableField)
    // Org associations are provided as fixed keys above; avoid duplicating them from the catalogue.
    .filter((field) => !ORG_AUDIENCE_FIELDS.some((org) => org.key === field.id))
    .map((field) => ({
      key: field.id,
      label: field.label ?? field.key,
      operators: operatorsForField(field),
      valueSource: valueSourceForField(field),
      group: field.isSystem ? ("System" as const) : ("Custom" as const),
    }));

  return [...orgFields, ...userFields];
}
