import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RoleFieldAccessDTO,
  UpdateRoleFieldAccessRequest,
} from "@/api/modules/roles/dto/RoleFieldAccessDTO";
import { rolesQueryKeys } from "@/components/modules/settings/modules/roles/utils/rolesQueryKeys";
import { useInvalidateAccessQuery } from "@/components/auth/useAccess";
import { UnauthorizedError } from "@/components/clients/exceptions";

export function useRoleFieldAccess(roleId: string) {
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  const invalidateAccess = useInvalidateAccessQuery();

  const query = useQuery<RoleFieldAccessDTO>({
    queryKey: rolesQueryKeys.roleFieldAccess(roleId),
    queryFn: async () =>
      internalApiClient.get<RoleFieldAccessDTO>(`/roles/${roleId}/field-access`),
  });

  const mutation = useMutation<void, Error, UpdateRoleFieldAccessRequest>({
    mutationFn: async (payload) =>
      internalApiClient.put<void, UpdateRoleFieldAccessRequest>(
        `/roles/${roleId}/field-access`,
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rolesQueryKeys.roleFieldAccess(roleId) });
      // accessHash now covers field access (v3), so our own /me/access must be refetched.
      // Go through useInvalidateAccessQuery so the cached ETag is dropped too.
      await invalidateAccess();
    },
    onError: async (error) => {
      // 401 PERM_HASH_MISMATCH means our own snapshot is stale, not that the session died — the
      // route already swapped the token cookie. Re-read access; the API client decides whether a
      // 401 is worth a logout.
      if (error instanceof UnauthorizedError) {
        await invalidateAccess();
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
