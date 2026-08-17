"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { AudienceValueSource } from "@/components/audience/fieldCatalog";
import type { OptionDTO } from "@/models/user/fields";

export type AudienceOption = { id: string; label: string };

// Sources backed by a flat reference endpoint returning { id, name, year? }.
// The chosen option's id (a UUID) is what the segment filter matches on.
// `people` is absent on purpose: the value editor renders a searchable people-picker instead of
// loading every employee into a dropdown.
const REMOTE_ENDPOINTS: Partial<Record<AudienceValueSource, string>> = {
  departments: "/departments",
  teams: "/teams",
  offices: "/office",
  legalEntities: "/legal-entity",
  calendars: "/public-holiday/calendars",
  jobs: "/jobs",
  roles: "/roles",
};

type RefRow = { id: string; name: string; year?: number };

// Normalises the value options for a picked field's source to { id, label }.
// - status / attributeOptions are resolved locally (no request);
// - org sources hit their flat endpoint;
// - freeText/number/date/jobs have no option list (picker falls back to a raw input).
export function useAudienceFieldOptions(
  source: AudienceValueSource,
  attributeOptions?: OptionDTO[] | null,
) {
  const { internalApiClient } = useAppDataContext();
  const endpoint = REMOTE_ENDPOINTS[source];

  const query = useQuery<RefRow[]>({
    queryKey: ["AUDIENCE_OPTIONS", source],
    enabled: Boolean(endpoint),
    staleTime: 5 * 60 * 1000,
    queryFn: () => internalApiClient.get<RefRow[]>(endpoint as string),
  });

  if (source === "attributeOptions") {
    // Backend matches attr filters on the option's value string, not its id. Enum-like system
    // fields send a separate label because their value is a code (FULL_TIME → "Full-time").
    const options = (attributeOptions ?? []).map((o) => ({ id: o.value, label: o.label ?? o.value }));
    return { options, isLoading: false, hasOptions: true };
  }

  if (!endpoint) {
    return { options: [] as AudienceOption[], isLoading: false, hasOptions: false };
  }

  const options: AudienceOption[] = (query.data ?? []).map((r) => ({
    id: r.id,
    label: r.year != null ? `${r.name} (${r.year})` : r.name,
  }));

  return { options, isLoading: query.isLoading, hasOptions: true };
}
