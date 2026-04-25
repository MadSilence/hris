import { useMutation } from "@tanstack/react-query";
import {
  renameRoleAction,
  RenameRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/RenameRoleAction/RenameRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useRenameRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: (payload: RenameRoleActionInput) => renameRoleAction(payload),
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
