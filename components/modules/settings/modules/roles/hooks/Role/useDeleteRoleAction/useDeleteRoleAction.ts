import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deleteRoleAction,
  DeleteRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/DeleteRoleAction/DeleteRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useDeleteRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async (payload: DeleteRoleActionInput) => {
      const result = await deleteRoleAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to delete role");
      }

      return result;
    },
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
