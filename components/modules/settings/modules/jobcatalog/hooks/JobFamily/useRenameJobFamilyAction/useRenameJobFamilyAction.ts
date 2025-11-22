import { useMutation } from "@tanstack/react-query";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import type { RenameJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction";
import { renameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction";

export const useRenameJobFamilyAction = () => {
  const revalidateJobFamilyQuery = useInvalidateJobFamilyQuery();

  return useMutation({
    mutationFn: (payload: RenameJobFamilyActionInput) =>
      renameJobFamilyAction(payload),
    onSuccess: () => {
      revalidateJobFamilyQuery();
    },
  });
};
