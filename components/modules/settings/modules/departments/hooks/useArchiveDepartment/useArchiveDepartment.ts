import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { archiveDepartmentAction } from "@/components/modules/settings/modules/departments/actions/archiveDepartmentAction/archiveDepartmentAction";

export const useArchiveDepartment = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await archiveDepartmentAction(id);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to archive department");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
