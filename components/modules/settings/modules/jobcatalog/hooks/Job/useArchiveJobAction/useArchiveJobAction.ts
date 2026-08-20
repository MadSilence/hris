import { useMutation } from "@tanstack/react-query";
import type { ArchiveJobActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/Job/archiveJobAction";
import { archiveJobAction } from "@/components/modules/settings/modules/jobcatalog/actions/Job/archiveJobAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useArchiveJobAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: ArchiveJobActionInput) => archiveJobAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
