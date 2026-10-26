import { useQuery } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { JobFamilyRestoreImpact } from "@/models/job";
import { JOB_FAMILY_QUERY_KEY } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/** Under the catalogue's one key, so the invalidation after any catalogue mutation covers it too. */
export const jobFamilyRestoreImpactQueryKey = (id: string | null) =>
  [JOB_FAMILY_QUERY_KEY, "restore-impact", id] as const;

/**
 * The archived positions that could come back with the family being restored. Asked only once
 * Unarchive is pressed, and asked fresh — the list is what the reader decides on — so nothing is kept
 * in the cache and a window focus does not refetch it behind an open dialog.
 */
export const useJobFamilyRestoreImpact = (id: string | null) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<JobFamilyRestoreImpact>({
    queryKey: jobFamilyRestoreImpactQueryKey(id),
    queryFn: () => internalApiClient.get<JobFamilyRestoreImpact>(`/job-family/${id}/restore-impact`),
    enabled: id !== null,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
