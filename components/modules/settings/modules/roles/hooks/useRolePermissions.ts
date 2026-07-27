import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RolePermissionsDTO, UpdateRolePermissionsRequest } from "@/api/modules/roles/dto/RolePermissionsDTO";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";
import { forceReauthRedirect, useInvalidateAccessQuery } from "@/components/auth/useAccess";
import { UnauthorizedError } from "@/components/clients/exceptions";

export function useRolePermissions(roleId: string) {
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  const invalidateAccess = useInvalidateAccessQuery();

  const query = useQuery<RolePermissionsDTO>({
    queryKey: rolesQueryKeys.rolePermissions(roleId),
    queryFn: async () =>
      internalApiClient.get<RolePermissionsDTO>(`/roles/${roleId}/permissions`),
  });

  const mutation = useMutation<void, Error, UpdateRolePermissionsRequest>({
    mutationFn: async (payload) =>
      internalApiClient.put<void, UpdateRolePermissionsRequest>(`/roles/${roleId}/permissions`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rolesQueryKeys.rolePermissions(roleId) });
      // Saving rotates perm_hash and the route already swapped our token cookie, so the
      // acting user's own access may have changed. Go through useInvalidateAccessQuery:
      // it also drops the cached ETag, otherwise the refetch 304s and keeps stale access.
      await invalidateAccess();
    },
    onError: (error) => {
      // 401 PERM_HASH_MISMATCH → the acting user's own hash is now stale: re-login.
      if (error instanceof UnauthorizedError) {
        forceReauthRedirect();
      }
    },
  });

  return {
    ...query,
    save: mutation.mutateAsync,
    saving: mutation.isPending,
    saveError: mutation.error,
  };
}
