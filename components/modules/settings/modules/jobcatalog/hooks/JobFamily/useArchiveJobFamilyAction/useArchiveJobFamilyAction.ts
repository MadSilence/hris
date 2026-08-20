import { useMutation } from "@tanstack/react-query";
import type { ArchiveJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/archiveJobFamilyAction";
import { archiveJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/archiveJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useArchiveJobFamilyAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: ArchiveJobFamilyActionInput) => archiveJobFamilyAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
