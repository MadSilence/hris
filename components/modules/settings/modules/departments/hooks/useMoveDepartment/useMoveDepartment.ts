import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { moveDepartmentAction } from "@/components/modules/settings/modules/departments/actions/moveDepartmentAction";

export const useMoveDepartment = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string | null }) => {
      const result = await moveDepartmentAction(id, { parentId });
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to move the department");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
