import { useMutation } from "@tanstack/react-query";
import type { DuplicateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/duplicateJobFamilyAction";
import { duplicateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/duplicateJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useDuplicateJobFamilyAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: DuplicateJobFamilyActionInput) => duplicateJobFamilyAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
