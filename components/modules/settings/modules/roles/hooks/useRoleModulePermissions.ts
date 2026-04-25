import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Level = "NONE" | "VIEW" | "EDIT" | "MANAGE";
type ModulesPayload = { modules: Record<string, Level> };

const key = (roleId: string) => ["ROLE_MODULES", roleId];

export function useRoleModulePermissions(roleId: string) {
  const { internalApiClient } = useAppDataContext();
  const qc = useQueryClient();

  const query = useQuery<ModulesPayload>({
    queryKey: key(roleId),
    queryFn: async () => internalApiClient.get<ModulesPayload>(`/roles/${roleId}/permissions/modules`),
  });

  const mutation = useMutation<void, Error, ModulesPayload>({
    mutationFn: async (payload) =>
      internalApiClient.put<void, ModulesPayload>(`/roles/${roleId}/permissions/modules`, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: key(roleId) });
    },
  });

  return { ...query, save: mutation.mutateAsync, saving: mutation.isPending };
}
