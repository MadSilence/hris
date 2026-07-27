import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  renameRoleAction,
  RenameRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/RenameRoleAction/RenameRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useRenameRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async (payload: RenameRoleActionInput) => {
      const result = await renameRoleAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to rename role");
      }

      return result;
    },
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
