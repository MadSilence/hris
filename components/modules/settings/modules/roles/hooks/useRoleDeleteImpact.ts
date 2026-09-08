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
    // One retry, not the default three. With exponential backoff the dialog sat on "checking what
    // depends on this role\u2026" for about seven seconds against a dead endpoint, and Delete was live
    // the whole time \u2014 which is the "presses Delete blind" the 2026-08-28 run reported, one layer
    // below where it was looked for.
    retry: 1,
  });
};
