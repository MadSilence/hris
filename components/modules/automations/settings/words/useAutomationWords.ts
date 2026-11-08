"use client";

import { useTranslations } from "next-intl";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { useReferenceOptions, type ReferenceOption } from "@/components/hooks/useReferenceOptions";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import { REFERENCE_RESOURCE } from "@/components/audience/fieldCatalog";
import { getCatalogOptions, isManagedCatalogType } from "@/models/attribute/managedCatalogs";
import { isReferenceField, type FieldDTO, type FilterDTO, type ReferenceValueSource } from "@/models/user/fields";
import { useDisplayLanguage, useDisplayLocale, useShortDates, useDateFormatter } from "@/lib/date";
import { useAutomationCatalog } from "../../hooks";
import type { AutomationCatalog } from "@/models/automations";
import { changeableFieldLabel } from "../triggers/FieldChangeFields";
import { useFillableLabel } from "../steps/WaitFields";
import { usePlaceholderLabel } from "../tokens/TokenTextField";
import { eventValueLabel, useEventFieldLabel } from "../conditions/EventConditionBuilder";
import { automationWords, type NameBook } from "./automationWords";

const ASSIGNABLE_SOURCE: Record<string, ReferenceValueSource> = {
  ROLE: "roles",
  TEAM: "teams",
  DEPARTMENT: "departments",
  LEGAL_ENTITY: "legalEntities",
  OFFICE: "offices",
  JOB: "jobs",
  PUBLIC_HOLIDAY_CALENDAR: "calendars",
  TIME_OFF_POLICY: "policies",
};

const EMPTY_CATALOG: AutomationCatalog = {
  triggers: [],
  dateFields: [],
  dateAttributes: [],
  changeableFields: [],
  actions: [],
  assignableTypes: [],
  placeholders: [],
  recipientKinds: [],
  roles: [],
  relations: [],
  defaultLateWindowDays: 30,
  events: [],
  processTemplates: [],
  reviewForms: [],
};

/** Every reference catalogue the words may name, each read only when the reader may see it (cached, shared). */
const useReferenceBook = (): Record<ReferenceValueSource, ReferenceOption[]> => {
  const { access } = useAccess();
  const may = (s: ReferenceValueSource) => {
    const resource = REFERENCE_RESOURCE[s];
    return !resource || canAccess({ access, resource, action: "VIEW" });
  };
  const departments = useReferenceOptions("departments", may("departments"));
  const teams = useReferenceOptions("teams", may("teams"));
  const offices = useReferenceOptions("offices", may("offices"));
  const legalEntities = useReferenceOptions("legalEntities", may("legalEntities"));
  const jobs = useReferenceOptions("jobs", may("jobs"));
  const levels = useReferenceOptions("levels", may("levels"));
  const calendars = useReferenceOptions("calendars", may("calendars"));
  const roles = useReferenceOptions("roles", may("roles"));
  const policies = useReferenceOptions("policies", may("policies"));
  return {
    departments: departments.options,
    teams: teams.options,
    offices: offices.options,
    legalEntities: legalEntities.options,
    jobs: jobs.options,
    levels: levels.options,
    calendars: calendars.options,
    roles: roles.options,
    policies: policies.options,
    people: [],
  };
};

const nameIn = (options: ReferenceOption[], id: string | null | undefined) => (id ? options.find((o) => o.id === id)?.label ?? null : null);

/**
 * The words of an automation (`contracts.ts` § SentencePart): `triggerTitle`, `triggerLine`, `stepKind`, `stepTitle`,
 * `stepSubtitle`, `sentence` — and `triggerSubtitle`, the When card's second line. Names of the company's things come
 * from the automation catalogue and the reference catalogues the rest of the app reads.
 */
export const useAutomationWords = () => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const catalogQuery = useAutomationCatalog();
  const catalog = catalogQuery.data ?? EMPTY_CATALOG;
  const fields = useUserFields();
  const refs = useReferenceBook();
  const short = useShortDates();
  const formatDate = useDateFormatter();
  const locale = useDisplayLocale();
  const language = useDisplayLanguage();
  const placeholder = usePlaceholderLabel();
  const fillable = useFillableLabel(catalog);
  const eventField = useEventFieldLabel();
  const dtos: FieldDTO[] = fields.data ?? [];
  const valueLabel = (dto: FieldDTO | undefined, v: string): string => {
    if (!dto) return v;
    if (isReferenceField(dto)) return nameIn(refs[dto.valueSource as ReferenceValueSource] ?? [], v) ?? v;
    if (dto.type === "DATE") return formatDate(v, { style: "medium" });
    if (isManagedCatalogType(dto.type)) return getCatalogOptions(dto.type, language).find((o) => o.value === v)?.label ?? v;
    const option = dto.options?.find((o) => o.id === v);
    if (option) return option.label ?? option.value;
    if (v === "true") return t("conditions.yes");
    if (v === "false") return t("conditions.no");
    return v;
  };
  const listFormat = new Intl.ListFormat(locale, { type: "conjunction" });
  const orFormat = new Intl.ListFormat(locale, { type: "disjunction" });
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const dayMonthFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });

  const names: NameBook = {
    role: (id) => catalog.roles.find((r) => r.id === id)?.name ?? nameIn(refs.roles, id),
    policy: (id) => nameIn(refs.policies, id),
    calendar: (id) => nameIn(refs.calendars, id),
    form: (id) => catalog.reviewForms.find((f) => f.value === id)?.label ?? null,
    processTemplate: (id) => catalog.processTemplates.find((p) => p.value === id)?.label ?? null,
    dateAttribute: (id) => catalog.dateAttributes.find((a) => a.value === id)?.label ?? null,
    changeableField: (value) => (value ? changeableFieldLabel(tA, catalog, value) : null),
    assignable: (type, id) => (type && ASSIGNABLE_SOURCE[type] ? nameIn(refs[ASSIGNABLE_SOURCE[type]], id) : null),
    fieldLabel: (field) => dtos.find((f) => f.id === field)?.label ?? null,
    filterValue: (filter: FilterDTO) => {
      const dto = dtos.find((f) => f.id === filter.field);
      if (filter.values?.length) return orFormat.format(filter.values.map((v) => valueLabel(dto, v)));
      if (filter.op === "between") return t("conditions.range", { from: valueLabel(dto, filter.value ?? ""), to: valueLabel(dto, filter.valueTo ?? "") });
      return valueLabel(dto, filter.value ?? "");
    },
    fillable,
    placeholder,
    eventField,
    eventValue: (v) => eventValueLabel(t, v),
  };

  return automationWords({
    t,
    tA,
    names,
    date: (iso) => short.date(iso),
    list: (items) => listFormat.format(items),
    // ISO weekdays: 2024-01-01 was a Monday.
    weekday: (day) => weekdayFormat.format(new Date(2024, 0, day)),
    dayOfMonth: (month, day) => dayMonthFormat.format(new Date(2024, month - 1, day)),
  });
};
