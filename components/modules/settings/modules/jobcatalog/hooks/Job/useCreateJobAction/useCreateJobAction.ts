import { useMutation } from "@tanstack/react-query";
import type { CreateJobActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/Job/createJobAction";
import { createJobAction } from "@/components/modules/settings/modules/jobcatalog/actions/Job/createJobAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

/**
 * Every catalogue mutation invalidates the one query the screen reads — families come back with
 * their jobs, headcounts and archive flags in a single response, so there is nothing finer to
 * invalidate.
 */
export const useCreateJobAction = () => {
  const invalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: CreateJobActionInput) => createJobAction(payload),
    onSuccess: () => {
      invalidateJobFamilyQuery();
    },
  });
};
