import { useMutation } from "@tanstack/react-query";
import type { DeleteJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/deleteJobFamilyAction";
import { deleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/deleteJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useDeleteJobFamilyAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: DeleteJobFamilyActionInput) => deleteJobFamilyAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
