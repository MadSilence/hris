import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import { addDepartmentMemberAction } from "@/components/modules/settings/modules/departments/actions/addDepartmentMemberAction/addDepartmentMemberAction";

export const useAddDepartmentMember = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const result = await addDepartmentMemberAction(id, userId);
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to add member");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
