import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { activateDepartmentAction } from "@/components/modules/settings/modules/departments/actions/activateDepartmentAction/activateDepartmentAction";

export const useActivateDepartment = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await activateDepartmentAction(id);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to activate department");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
