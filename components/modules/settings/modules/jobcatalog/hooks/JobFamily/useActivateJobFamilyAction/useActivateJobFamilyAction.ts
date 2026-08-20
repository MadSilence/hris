import { useMutation } from "@tanstack/react-query";
import type { ActivateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/activateJobFamilyAction";
import { activateJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/activateJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useActivateJobFamilyAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: ActivateJobFamilyActionInput) => activateJobFamilyAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
