import { useQuery } from "@tanstack/react-query";
import { internalApiClient } from "@/components/clients/apiClient";
import type { DetachedPeopleImpact } from "@/models/user/DetachedPeopleImpact";

/**
 * Who deleting an office or a legal entity would detach. Asked only while the dialog is open and asked
 * fresh: the list is what the reader is deciding on. One retry, so a dead endpoint says so quickly.
 */
export const useDetachedPeopleImpact = (resourcePath: "offices" | "legal-entities", id: string | null, enabled: boolean) =>
  useQuery({
    queryKey: ["DETACHED_PEOPLE_IMPACT", resourcePath, id],
    queryFn: () => internalApiClient.get<DetachedPeopleImpact>(`/${resourcePath}/${id}/delete-impact`),
    enabled: enabled && Boolean(id),
    staleTime: 0,
    retry: 1,
  });
