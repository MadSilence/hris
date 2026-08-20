import { useMutation } from "@tanstack/react-query";
import type { CreateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/createJobFamilyAction";
import { createJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/createJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useCreateJobFamilyAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: CreateJobFamilyActionInput) => createJobFamilyAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
