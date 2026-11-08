"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { PersonRef } from "@/models/automations";

export type OwnerCandidate = { id: string; name: string; avatarUrl: string | null; detail: string };

/**
 * The people the Change owner picker lists: only those who may manage automations (O1's "Only people who can manage
 * automations"), matching what is typed — `GET /automations/owner-candidates`.
 */
export const useOwnerCandidates = (q: string, enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<OwnerCandidate[]>({
    queryKey: ["AUTOMATIONS", "OWNER_CANDIDATES", q],
    queryFn: async () => {
      const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const people = await internalApiClient.get<PersonRef[]>(`/automations/owner-candidates${query}`);
      return people.filter((p) => p.id).map((p) => ({ id: p.id as string, name: p.name ?? "", avatarUrl: null, detail: "" }));
    },
    enabled,
    placeholderData: keepPreviousData,
  });
};
