import { useMutation } from "@tanstack/react-query";
import type { DeleteJobActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/Job/deleteJobAction";
import { deleteJobAction } from "@/components/modules/settings/modules/jobcatalog/actions/Job/deleteJobAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useDeleteJobAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: DeleteJobActionInput) => deleteJobAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
