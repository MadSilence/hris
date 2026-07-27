import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  duplicateRoleAction,
  DuplicateRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/DuplicateRoleAction/DuplicateRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useDuplicateRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async (payload: DuplicateRoleActionInput) => {
      const result = await duplicateRoleAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to duplicate role");
      }

      return result;
    },
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
