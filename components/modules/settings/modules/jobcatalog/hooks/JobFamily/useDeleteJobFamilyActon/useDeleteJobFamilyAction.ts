import { useMutation } from "@tanstack/react-query";
import type { DeleteJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction";
import { deleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

export const useDeleteJobFamilyAction = () => {
  const revalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: DeleteJobFamilyActionInput) =>
      deleteJobFamilyAction(payload),
    onSuccess: () => {
      revalidateJobFamilyQuery();
    },
  });
};
