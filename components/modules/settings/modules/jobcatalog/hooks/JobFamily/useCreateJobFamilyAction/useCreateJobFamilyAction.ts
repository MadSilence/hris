import { useMutation } from "@tanstack/react-query";
import type { CreateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction";
import { createJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

export const useCreateJobFamilyAction = () => {
  const revalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: CreateJobFamilyActionInput) =>
      createJobFamilyAction(payload),
    onSuccess: () => {
      revalidateJobFamilyQuery();
    },
  });
};
