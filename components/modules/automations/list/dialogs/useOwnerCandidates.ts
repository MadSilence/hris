"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";

/** What `GET /automations/owner-candidates` answers for each person. */
type OwnerCandidateDTO = {
  id: string | null;
  name: string | null;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  office?: string | null;
  role?: string | null;
};

/** A person the picker lists: `detail` is "{job title} · {office}"; `role` is the first role they hold, by name. */
export type OwnerCandidate = { id: string; name: string; avatarUrl: string | null; detail: string; role: string | null };

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
      const people = await internalApiClient.get<OwnerCandidateDTO[]>(`/automations/owner-candidates${query}`);
      return people
        .filter((p) => p.id)
        .map((p) => ({
          id: p.id as string,
          name: p.name ?? "",
          avatarUrl: p.avatarUrl ?? null,
          detail: [p.jobTitle, p.office].filter(Boolean).join(" · "),
          role: p.role ?? null,
        }));
    },
    enabled,
    placeholderData: keepPreviousData,
  });
};
