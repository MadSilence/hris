import { useMutation } from "@tanstack/react-query";
import {
  deleteRoleAction,
  DeleteRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/DeleteRoleAction/DeleteRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useDeleteRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: (payload: DeleteRoleActionInput) => deleteRoleAction(payload),
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
