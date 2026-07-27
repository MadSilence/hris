import { InternalApiClient } from "@/components/clients/apiClient";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery } from "@tanstack/react-query";
import { Role } from "@/models/role/Role";
import { useQueryClient } from "@tanstack/react-query";
import { rolesQueryKeys, ROLES_QUERY_KEY } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";

export { ROLES_QUERY_KEY };

const getRoles = async (apiClient: InternalApiClient): Promise<Role[]> =>
  apiClient.get<Role[]>("/roles");

export const useRoles = () => {
  const {internalApiClient} = useAppDataContext();

  return useQuery<Role[]>({
    queryKey: rolesQueryKeys.roles(),
    queryFn: () => getRoles(internalApiClient),
  });
};

export const useInvalidateRolesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.roles() });
  };
};
