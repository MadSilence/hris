import { OPERATOR_LABELS, type AudienceOperator } from "@/components/audience/fieldCatalog";
import type { FieldDTO, FilterDTO, ReferenceValueSource } from "@/models/user/fields";
import type { Segment } from "@/models/segment/Segment";
import {
  actionSentence,
  triggerSentence,
  type AssignableType,
  type AutomationCatalog,
  type AutomationDefinition,
} from "@/models/automations";

const SOURCE_TYPE: Partial<Record<ReferenceValueSource, AssignableType>> = {
  roles: "ROLE",
  teams: "TEAM",
  departments: "DEPARTMENT",
  legalEntities: "LEGAL_ENTITY",
  offices: "OFFICE",
  jobs: "JOB",
  calendars: "PUBLIC_HOLIDAY_CALENDAR",
};

const fieldOf = (fields: FieldDTO[] | undefined, key: string) =>
  fields?.find((f) => f.id === key || f.key === key);

/** Which catalogues a definition's sentence needs names from — its targets and its condition values. */
export const typesInDefinition = (
  definition: AutomationDefinition | null | undefined,
  fields: FieldDTO[] | undefined,
): Set<AssignableType> => {
  const types = new Set<AssignableType>();
  if (!definition) return types;
  for (const a of definition.actions) {
    if (a.type === "GRANT_TIME_OFF_POLICY") types.add("TIME_OFF_POLICY");
    else if (a.assignableType) types.add(a.assignableType);
  }
  for (const f of definition.conditions?.filters ?? []) {
    const source = fieldOf(fields, f.field)?.valueSource;
    const type = source ? SOURCE_TYPE[source] : undefined;
    if (type) types.add(type);
  }
  return types;
};

const valueName = (field: FieldDTO | undefined, raw: string, targets: Map<string, string>): string => {
  if (field?.valueSource) return targets.get(raw) ?? raw;
  const option = field?.options?.find((o) => o.id === raw || o.value === raw);
  return option ? option.label ?? option.value : raw;
};

const filterText = (f: FilterDTO, fields: FieldDTO[] | undefined, targets: Map<string, string>): string => {
  const field = fieldOf(fields, f.field);
  const label = field?.label ?? f.field;
  const op = (OPERATOR_LABELS[f.op as AudienceOperator] ?? f.op).toLowerCase();
  const values = f.values?.length ? f.values : f.value ? [f.value] : [];
  const shown = values.map((v) => valueName(field, v, targets)).join(", ");
  const range = f.op === "between" && f.valueTo ? ` and ${f.valueTo}` : "";
  return `${label} ${op} ${shown}${range}`.trim();
};

/** "everyone", or "people whose Office is Berlin and Department is any of Sales, Support". */
export const conditionsSentence = (
  segment: Segment | null | undefined,
  fields: FieldDTO[] | undefined,
  targets: Map<string, string>,
): string => {
  const filters = segment?.filters ?? [];
  if (filters.length === 0) return "everyone";
  return `people whose ${filters.map((f) => filterText(f, fields, targets)).join(" and ")}`;
};

/** The whole rule as the list reads it: "When someone is hired · for everyone → Email the person: Welcome". */
export const ruleSentence = (
  definition: AutomationDefinition | null | undefined,
  options: {
    catalog?: AutomationCatalog;
    fields?: FieldDTO[];
    targets: Map<string, string>;
    roles?: Map<string, string>;
  },
): { when: string; forWhom: string; does: string } => {
  if (!definition) return { when: "", forWhom: "", does: "" };
  const when = triggerSentence(definition.trigger, options.catalog ?? {});
  const forWhom = conditionsSentence(definition.conditions, options.fields, options.targets);
  const does = definition.actions.length
    ? definition.actions.map((a) => actionSentence(a, { targets: options.targets, roles: options.roles })).join(", then ")
    : "nothing yet";
  return { when, forWhom, does };
};
