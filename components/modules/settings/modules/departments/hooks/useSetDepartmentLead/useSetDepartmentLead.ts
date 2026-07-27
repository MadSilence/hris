import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { setDepartmentLeadAction } from "@/components/modules/settings/modules/departments/actions/setDepartmentLeadAction/setDepartmentLeadAction";

export const useSetDepartmentLead = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const result = await setDepartmentLeadAction(id, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to set department lead");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
