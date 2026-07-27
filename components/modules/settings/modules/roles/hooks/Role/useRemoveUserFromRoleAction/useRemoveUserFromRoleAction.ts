import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  removeUserFromRoleAction,
  RemoveUserFromRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/RemoveUserFromRoleAction/RemoveUserFromRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { PEOPLE_SEARCH_QK } from "@/components/modules/organization/hooks/usePeopleSearch/usePeopleSearch";

export const useRemoveUserFromRoleAction = () => {
  const queryClient = useQueryClient();
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async (payload: RemoveUserFromRoleActionInput) => {
      const result = await removeUserFromRoleAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to remove user from role");
      }

      return result;
    },
    onSuccess: async () => {
      revalidateRolesQuery();
      await queryClient.invalidateQueries({ queryKey: [PEOPLE_SEARCH_QK] });
    },
  });
};
