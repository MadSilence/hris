"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import { usePublicHolidayCalendars } from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import type { AssignableType, CalendarRelation } from "@/models/automations";
import type { ReferenceValueSource } from "@/models/user/fields";
import { CompactPick, type PickOption } from "../conditions/chrome";
import { Field, FieldStack, MistNote } from "../parts/parts";
import { errorFor } from "../parts/problems";
import type { StepPartProps } from "./stepPartProps";

/** Where the things of each kind are read from — the reference catalogues every picker of the app uses. */
export const ASSIGNABLE_SOURCE: Record<Exclude<AssignableType, "TIME_OFF_POLICY" | "PUBLIC_HOLIDAY_CALENDAR">, ReferenceValueSource> = {
  ROLE: "roles",
  TEAM: "teams",
  DEPARTMENT: "departments",
  LEGAL_ENTITY: "legalEntities",
  OFFICE: "offices",
  JOB: "jobs",
};

const RELATION = "rel:";

/**
 * Which calendar (S5c): the ones that change with each person first — their office's, country's, legal entity's
 * (the catalogue's `relations`) — then the calendars A–Z, each country with its flag (Q-3).
 */
const useCalendarOptions = (relations: CalendarRelation[]) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const calendars = usePublicHolidayCalendars();
  const options: PickOption[] = [
    ...relations.map((r) => ({ value: `${RELATION}${r}`, label: tA(`relation.${r}`), group: t("assign.changesWithPerson") })),
    ...[...(calendars.data ?? [])]
      .filter((c) => !c.archivedAt)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({
        value: c.id,
        label: c.name,
        group: t("assign.calendarsAZ"),
        icon: c.sourceCountryCode ? <CountryFlag countryCode={c.sourceCountryCode} className="h-3.5 w-5" /> : undefined,
      })),
  ];
  return { options, isLoading: calendars.isLoading, isError: calendars.isError, refetch: calendars.refetch };
};

/** Assign or unassign (S5, S5b, S5c): the action, what kind of thing, and which. */
export const AssignFields: React.FC<StepPartProps> = ({ step, catalog, problems, onStep }) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const actionId = React.useId();
  const kinds = catalog.assignableTypes.filter((k) => k !== "TIME_OFF_POLICY");
  const kind = step.assignableType && step.assignableType !== "TIME_OFF_POLICY" ? step.assignableType : null;
  const calendar = kind === "PUBLIC_HOLIDAY_CALENDAR";
  const source = kind && kind !== "PUBLIC_HOLIDAY_CALENDAR" ? ASSIGNABLE_SOURCE[kind] : undefined;
  const reference = useReferenceOptions(source, Boolean(source));
  const calendars = useCalendarOptions(calendar ? catalog.relations : []);

  const options: PickOption[] = calendar
    ? calendars.options
    : [...reference.options].sort((a, b) => a.label.localeCompare(b.label)).map((o) => ({ value: o.id, label: o.label }));
  const value = step.relation ? `${RELATION}${step.relation}` : step.assignableId ?? null;
  const gone = Boolean(step.assignableId) && !(calendar ? calendars.isLoading : reference.isLoading) && !options.some((o) => o.value === value);

  return (
    <FieldStack>
      <Field label={t("assign.action")} labelId={actionId} error={errorFor(t, problems, "action")}>
        <SegmentedControl<"ASSIGN" | "UNASSIGN">
          aria-labelledby={actionId}
          value={step.type === "UNASSIGN" ? "UNASSIGN" : "ASSIGN"}
          onChange={(type) => onStep({ type })}
          options={[
            { value: "ASSIGN", label: t("assign.assign") },
            { value: "UNASSIGN", label: t("assign.unassign") },
          ]}
        />
      </Field>
      <Field label={t("assign.what")} required error={errorFor(t, problems, "assignableType")}>
        <CompactPick
          size="md"
          options={kinds.map((k) => ({ value: k, label: tA(`assignable.${k}`) }))}
          value={kind}
          onChange={(v) => onStep({ assignableType: v as AssignableType, assignableId: null, relation: null })}
          placeholder={t("assign.pickWhat")}
          emptyLabel={t("common.noResults")}
          ariaLabel={t("assign.what")}
        />
      </Field>
      {kind && (
        <Field label={t("assign.which")} required error={gone ? t("problems.removed") : errorFor(t, problems, "assignableId")}>
          <CompactPick
            size="md"
            options={options}
            value={gone ? null : value}
            onChange={(v) =>
              v.startsWith(RELATION)
                ? onStep({ relation: v.slice(RELATION.length) as CalendarRelation, assignableId: null })
                : onStep({ assignableId: v, relation: null })
            }
            placeholder={t("assign.pickWhich")}
            emptyLabel={calendar ? t("assign.noCalendars") : t("common.noResults")}
            ariaLabel={t("assign.which")}
            loading={calendar ? calendars.isLoading : reference.isLoading}
            failed={calendar && calendars.isError ? { onRetry: () => void calendars.refetch() } : null}
            invalid={gone || Boolean(errorFor(t, problems, "assignableId"))}
          />
        </Field>
      )}
      <MistNote>{t(calendar ? "assign.noteCalendar" : "assign.note")}</MistNote>
    </FieldStack>
  );
};

/**
 * Grant a time-off policy (S6, S6b): the company's policies A–Z with their yearly amount. No "Changes with each
 * person" group (QA2) — a policy is not bound to a place, so there is nothing to resolve it from.
 */
export const PolicyFields: React.FC<StepPartProps> = ({ step, problems, onStep }) => {
  const t = useTranslations("automationsSettings");
  const policies = useTimeOffPolicies();
  const list = [...(policies.data ?? [])].filter((p) => !p.archivedAt).sort((a, b) => a.name.localeCompare(b.name));
  const gone = Boolean(step.policyId) && !policies.isLoading && !list.some((p) => p.id === step.policyId);
  return (
    <FieldStack>
      <Field label={t("policy.label")} required error={gone ? t("problems.removed") : errorFor(t, problems, "policyId")}>
        <CompactPick
          size="md"
          options={list.map((p) => ({
            value: p.id,
            label: p.name,
            group: t("policy.az"),
            hint: p.unlimitedQuota ? t("policy.unlimited") : p.yearlyQuota != null ? t("policy.days", { count: p.yearlyQuota }) : undefined,
          }))}
          value={gone ? null : step.policyId ?? null}
          onChange={(policyId) => onStep({ policyId })}
          placeholder={t("policy.pick")}
          emptyLabel={t("policy.noPolicies")}
          ariaLabel={t("policy.label")}
          loading={policies.isLoading}
          failed={policies.isError ? { onRetry: () => void policies.refetch() } : null}
          invalid={gone || Boolean(errorFor(t, problems, "policyId"))}
        />
      </Field>
      <MistNote>{t("policy.note")}</MistNote>
    </FieldStack>
  );
};
