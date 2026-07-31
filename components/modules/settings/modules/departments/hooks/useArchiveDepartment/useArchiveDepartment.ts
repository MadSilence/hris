import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateDepartmentsQuery } from "@/components/modules/settings/modules/departments/hooks/useInvalidateDepartmentsQuery/useInvalidateDepartmentsQuery";
import {
  archiveDepartmentAction,
  type ArchiveDepartmentActionInput,
} from "@/components/modules/settings/modules/departments/actions/archiveDepartmentAction/archiveDepartmentAction";

export const useArchiveDepartment = () => {
  const invalidate = useInvalidateDepartmentsQuery();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ArchiveDepartmentActionInput>) => {
      const hasPayload = Object.keys(payload).length > 0;
      const result = await archiveDepartmentAction(
        id,
        hasPayload ? (payload as ArchiveDepartmentActionInput) : undefined,
      );
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to archive department");
      }
      return result;
    },
    onSuccess: () => invalidate(),
  });
};
