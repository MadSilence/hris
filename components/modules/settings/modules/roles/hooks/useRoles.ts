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
    /**
     * Reference data several components read at once, with an explicit invalidator beside it.
     *
     * Without a `staleTime` the default is 0, so each component that mounts and reads this hook
     * finds the cache stale and refetches — the profile's Time Off tab fetched its policies three
     * times per render for exactly this reason. The role detail page has the same shape: the
     * container and both of its panels read this list. Every mutation invalidates the key, so
     * holding it fresh for five minutes cannot serve a stale answer after a change.
     */
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvalidateRolesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.roles() });
  };
};
