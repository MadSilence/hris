import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import {
  deleteDepartmentAction,
  type DeleteDepartmentActionInput,
} from "@/components/modules/settings/modules/departments/actions/deleteDepartmentAction/deleteDepartmentAction";

export const useDeleteDepartment = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & DeleteDepartmentActionInput) => {
      const result = await deleteDepartmentAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to delete department");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
