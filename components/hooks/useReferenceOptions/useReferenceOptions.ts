"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { ReferenceValueSource } from "@/models/user/fields";

export type ReferenceOption = { id: string; label: string };

/**
 * Where each reference catalogue is read from. One map for the whole app — the audience builder and
 * the profile pickers ask the same question, and two copies would drift.
 * `people` is absent on purpose: employees are searched through a picker, never enumerated.
 */
export const REFERENCE_ENDPOINTS: Partial<Record<ReferenceValueSource, string>> = {
  departments: "/departments",
  teams: "/teams",
  offices: "/office",
  legalEntities: "/legal-entity",
  calendars: "/public-holiday/calendars",
  jobs: "/jobs",
  roles: "/roles",
};

type RefRow = { id: string; name: string; year?: number };

export const useReferenceOptions = (
  source: ReferenceValueSource | undefined,
  enabled = true,
) => {
  const { internalApiClient } = useAppDataContext();
  const endpoint = source ? REFERENCE_ENDPOINTS[source] : undefined;

  const query = useQuery<RefRow[]>({
    queryKey: ["REFERENCE_OPTIONS", source],
    enabled: Boolean(endpoint) && enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: () => internalApiClient.get<RefRow[]>(endpoint as string),
  });

  const options: ReferenceOption[] = (query.data ?? []).map((row) => ({
    id: row.id,
    // Calendars repeat their name per year, so the year is part of the label or they read as dupes.
    label: row.year != null ? `${row.name} (${row.year})` : row.name,
  }));

  return { options, isLoading: query.isLoading, hasEndpoint: Boolean(endpoint) };
};
