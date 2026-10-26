"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReferenceOptions, type ReferenceOption } from "@/components/hooks/useReferenceOptions";
import { getTimeOffPoliciesQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";
import type { ReferenceValueSource } from "@/models/user/fields";
import type { AssignableType } from "@/models/automations";

/** Where each assignable type's catalogue comes from — the same catalogues the profile pickers read. */
export const ASSIGNABLE_SOURCE: Record<Exclude<AssignableType, "TIME_OFF_POLICY">, ReferenceValueSource> = {
  ROLE: "roles",
  TEAM: "teams",
  DEPARTMENT: "departments",
  LEGAL_ENTITY: "legalEntities",
  OFFICE: "offices",
  JOB: "jobs",
  PUBLIC_HOLIDAY_CALENDAR: "calendars",
};

const usePolicyOptions = (enabled: boolean) => {
  const query = useQuery({
    queryKey: getTimeOffPoliciesQueryKey(),
    queryFn: () => timeOffPoliciesService.list(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
  const options: ReferenceOption[] = useMemo(
    () => (query.data ?? []).map((p) => ({ id: p.id, label: p.displayName || p.name })),
    [query.data],
  );
  return { options, isLoading: query.isLoading };
};

/** The options of one assignable type, for a picker. */
export const useAssignableOptions = (type: AssignableType | null | undefined) => {
  const source = type && type !== "TIME_OFF_POLICY" ? ASSIGNABLE_SOURCE[type] : undefined;
  const reference = useReferenceOptions(source, Boolean(source));
  const policies = usePolicyOptions(type === "TIME_OFF_POLICY");
  return type === "TIME_OFF_POLICY" ? policies : { options: reference.options, isLoading: reference.isLoading };
};

/**
 * Every name a rule's sentence may need — targets of each type, and role names for recipients — as
 * one id → name map. Only the catalogues for the types in `types` are fetched; they are cached for
 * five minutes, so a list of twenty rules asks each catalogue once.
 */
export const useAutomationNames = (types: ReadonlySet<AssignableType>, withRoles = false) => {
  const roles = useReferenceOptions("roles", types.has("ROLE") || withRoles);
  const teams = useReferenceOptions("teams", types.has("TEAM"));
  const departments = useReferenceOptions("departments", types.has("DEPARTMENT"));
  const legalEntities = useReferenceOptions("legalEntities", types.has("LEGAL_ENTITY"));
  const offices = useReferenceOptions("offices", types.has("OFFICE"));
  const jobs = useReferenceOptions("jobs", types.has("JOB"));
  const calendars = useReferenceOptions("calendars", types.has("PUBLIC_HOLIDAY_CALENDAR"));
  const policies = usePolicyOptions(types.has("TIME_OFF_POLICY"));

  return useMemo(() => {
    const targets = new Map<string, string>();
    for (const list of [roles, teams, departments, legalEntities, offices, jobs, calendars, policies]) {
      for (const option of list.options) targets.set(option.id, option.label);
    }
    const roleNames = new Map(roles.options.map((o) => [o.id, o.label] as const));
    return { targets, roles: roleNames };
  }, [roles, teams, departments, legalEntities, offices, jobs, calendars, policies]);
};
