import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { removeDepartmentMemberAction } from "@/components/modules/settings/modules/departments/actions/removeDepartmentMemberAction/removeDepartmentMemberAction";

export const useRemoveDepartmentMember = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const result = await removeDepartmentMemberAction(id, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to remove member");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
