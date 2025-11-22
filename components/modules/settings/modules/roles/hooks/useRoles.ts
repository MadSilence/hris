import { InternalApiClient } from "@/components/clients/apiClient";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery } from "@tanstack/react-query";
import { Role } from "@/models/role/Role";

export const ROLES_QUERY_KEY = "ROLES";

const getRoles = async (apiClient: InternalApiClient): Promise<Role[]> =>
  apiClient.get<Role[]>("/roles");

export const useRoles = () => {
  const {internalApiClient} = useAppDataContext();

  return useQuery<Role[]>({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: () => getRoles(internalApiClient),
  });
};
