import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  archiveRoleAction,
  ArchiveRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/ArchiveRoleAction/ArchiveRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useArchiveRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async (payload: ArchiveRoleActionInput) => {
      const result = await archiveRoleAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage ?? (payload.archived ? "Failed to archive role" : "Failed to restore role"),
        );
      }

      return result;
    },
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
