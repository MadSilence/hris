import { useMutation } from "@tanstack/react-query";
import type { UpdateJobActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/Job/updateJobAction";
import { updateJobAction } from "@/components/modules/settings/modules/jobcatalog/actions/Job/updateJobAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useUpdateJobAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: UpdateJobActionInput) => updateJobAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
