import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import {
  updateDepartmentAction,
  type UpdateDepartmentActionInput,
} from "@/components/modules/settings/modules/departments/actions/updateDepartmentAction/updateDepartmentAction";

export const useUpdateDepartment = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateDepartmentActionInput) => {
      const result = await updateDepartmentAction(id, payload);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to update department");
      }
      return result;
    },
    onSuccess: () => invalidate(),
    // A refusal can mean the tree is stale (E00409: someone else saved first). The open dialog keeps
    // the node it was opened with; refetching means reopening it starts from the current version.
    onError: () => invalidate(),
  });
};
