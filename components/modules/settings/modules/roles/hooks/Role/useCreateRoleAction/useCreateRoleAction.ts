import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  createRoleAction,
  CreateRoleActionInput,
} from "@/components/modules/settings/modules/roles/actions/Role/CreateRoleAction/CreateRoleAction";
import { useInvalidateRolesQuery } from "@/components/modules/settings/modules/roles/hooks/useRoles";

export const useCreateRoleAction = () => {
  const revalidateRolesQuery = useInvalidateRolesQuery();

  return useMutation({
    mutationFn: async (payload: CreateRoleActionInput) => {
      const result = await createRoleAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage ?? "Failed to create role");
      }

      return result;
    },
    onSuccess: () => {
      revalidateRolesQuery();
    },
  });
};
