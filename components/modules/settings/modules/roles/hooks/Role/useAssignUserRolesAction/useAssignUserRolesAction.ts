import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { assignUserRolesAction } from "@/components/modules/settings/modules/roles/actions/Role/AssignUserRolesAction/AssignUserRolesAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";
import { accessQueryKeys } from "@/components/auth/accessQueryKeys";

export type AssignUserRolesPayload = {
  userId: string;
  roleIds: string[];
  currentRoleIds: string[];
};

export const useAssignUserRolesAction = () => {
  const queryClient = useQueryClient();
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async ({ userId, roleIds, currentRoleIds }: AssignUserRolesPayload) => {
      const result = await assignUserRolesAction({
        userId,
        assignRoleIds: roleIds.filter((id) => !currentRoleIds.includes(id)),
        removeRoleIds: currentRoleIds.filter((id) => !roleIds.includes(id)),
      });

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to update assigned roles");
      }

      return result;
    },
    onSuccess: async () => {
      revalidateRolesQuery();
      await queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
      // Assigning roles can change the acting user's own effective access.
      await queryClient.invalidateQueries({ queryKey: accessQueryKeys.meAccess() });
    },
  });
};
