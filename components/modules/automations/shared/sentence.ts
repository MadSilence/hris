import { operatorLabel, type AudienceOperator } from "@/components/audience/fieldCatalog";
import type { AccessTranslator } from "@/components/audience/accessTranslator";
import type { FieldDTO, FilterDTO, ReferenceValueSource } from "@/models/user/fields";
import type { Segment } from "@/models/segment/Segment";
import type { AssignableType, AutomationCatalog, AutomationDefinition } from "@/models/automations";
import { actionSentence, triggerSentence, type AutomationsT } from "./vocabulary";

const SOURCE_TYPE: Partial<Record<ReferenceValueSource, AssignableType>> = {
  roles: "ROLE",
  teams: "TEAM",
  departments: "DEPARTMENT",
  legalEntities: "LEGAL_ENTITY",
  offices: "OFFICE",
  jobs: "JOB",
  calendars: "PUBLIC_HOLIDAY_CALENDAR",
  policies: "TIME_OFF_POLICY",
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

const filterText = (t: AutomationsT, tAccess: AccessTranslator, f: FilterDTO, fields: FieldDTO[] | undefined, targets: Map<string, string>): string => {
  const field = fieldOf(fields, f.field);
  const label = field?.label ?? f.field;
  const op = operatorLabel(tAccess, f.op as AudienceOperator).toLowerCase();
  const values = f.values?.length ? f.values : f.value ? [f.value] : [];
  const shown = values.map((v) => valueName(field, v, targets)).join(", ");
  const text = f.op === "between" && f.valueTo
    ? t("sentence.conditions.filterRange", { field: label, op, values: shown, to: f.valueTo })
    : t("sentence.conditions.filter", { field: label, op, values: shown });
  return text.trim();
};

/** "everyone", or "people whose Office is Berlin and Department is any of Sales, Support". */
export const conditionsSentence = (
  t: AutomationsT,
  tAccess: AccessTranslator,
  segment: Segment | null | undefined,
  fields: FieldDTO[] | undefined,
  targets: Map<string, string>,
): string => {
  const filters = segment?.filters ?? [];
  if (filters.length === 0) return t("sentence.conditions.everyone");
  const joined = filters.map((f) => filterText(t, tAccess, f, fields, targets))
    .reduce((left, right) => t("sentence.conditions.and", { left, right }));
  return t("sentence.conditions.whose", { filters: joined });
};

/** The whole rule as the list reads it: "When someone is hired · for everyone → Email the person: Welcome". */
export const ruleSentence = (
  t: AutomationsT,
  tAccess: AccessTranslator,
  definition: AutomationDefinition | null | undefined,
  options: {
    catalog?: AutomationCatalog;
    fields?: FieldDTO[];
    targets: Map<string, string>;
    roles?: Map<string, string>;
  },
): { when: string; forWhom: string; does: string } => {
  if (!definition) return { when: "", forWhom: "", does: "" };
  const when = triggerSentence(t, definition.trigger, options.catalog ?? {});
  const forWhom = conditionsSentence(t, tAccess, definition.conditions, options.fields, options.targets);
  const does = definition.actions.length
    ? definition.actions.map((a) => actionSentence(t, a, { targets: options.targets, roles: options.roles }))
      .reduce((left, right) => t("sentence.rule.then", { left, right }))
    : t("sentence.rule.nothingYet");
  return { when, forWhom, does };
};
