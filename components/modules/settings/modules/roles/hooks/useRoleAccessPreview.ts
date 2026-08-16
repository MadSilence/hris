import { useQuery } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { RoleAccessPreviewDTO } from "@/api/modules/roles/dto/RoleAccessPreviewDTO";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";

const previewAccess = async (
  apiClient: InternalApiClient,
  roleIds: string[],
): Promise<RoleAccessPreviewDTO> =>
  apiClient.post<RoleAccessPreviewDTO>("/roles/preview", { roleIds });

/**
 * Resolves the currently *selected* roles, not the saved ones — the point is to see what a change
 * would do before applying it. Keyed by the sorted id set so ticking a box refetches and unticking
 * it back is served from cache.
 */
export const useRoleAccessPreview = (roleIds: string[], enabled: boolean) => {
  const { internalApiClient } = useAppDataContext();
  const key = [...roleIds].sort();

  return useQuery<RoleAccessPreviewDTO>({
    queryKey: rolesQueryKeys.roleAccessPreview(key),
    queryFn: () => previewAccess(internalApiClient, key),
    enabled: enabled && key.length > 0,
    staleTime: 60_000,
  });
};
