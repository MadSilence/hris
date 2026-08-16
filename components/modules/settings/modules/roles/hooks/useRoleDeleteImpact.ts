import { useQuery } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { RoleDeleteImpactDTO } from "@/api/modules/roles/dto/RoleDeleteImpactDTO";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";

const getImpact = async (apiClient: InternalApiClient, roleId: string): Promise<RoleDeleteImpactDTO> =>
  apiClient.get<RoleDeleteImpactDTO>(`/roles/${roleId}/impact`);

/**
 * Fetched only while the delete dialog is open — the numbers are a snapshot taken at the moment
 * the admin is about to decide, so caching them longer would be misleading.
 */
export const useRoleDeleteImpact = (roleId: string | null | undefined) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<RoleDeleteImpactDTO>({
    queryKey: rolesQueryKeys.roleDeleteImpact(roleId ?? ""),
    queryFn: () => getImpact(internalApiClient, roleId!),
    enabled: Boolean(roleId),
    staleTime: 0,
    gcTime: 0,
  });
};
