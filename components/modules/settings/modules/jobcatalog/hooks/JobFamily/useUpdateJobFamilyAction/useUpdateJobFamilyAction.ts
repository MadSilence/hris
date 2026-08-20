import { useMutation } from "@tanstack/react-query";
import type { UpdateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/updateJobFamilyAction";
import { updateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/updateJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useUpdateJobFamilyAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: UpdateJobFamilyActionInput) => updateJobFamilyAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
