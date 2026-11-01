"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { IdentityConnectionDTO, IdpGroupDTO, ScimTokenDTO } from "@/api/modules/identity/dto";

export const identityQueryKeys = {
  connection: () => ["IDENTITY_CONNECTION"] as const,
  tokens: () => ["IDENTITY_SCIM_TOKENS"] as const,
  groups: () => ["IDENTITY_GROUPS"] as const,
};

export const useIdentityConnection = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<IdentityConnectionDTO>({
    queryKey: identityQueryKeys.connection(),
    queryFn: () => internalApiClient.get<IdentityConnectionDTO>("/settings/identity/connection"),
    enabled,
  });
};

export const useScimTokens = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<ScimTokenDTO[]>({
    queryKey: identityQueryKeys.tokens(),
    queryFn: () => internalApiClient.get<ScimTokenDTO[]>("/settings/identity/scim-tokens"),
    enabled,
  });
};

export const useIdpGroups = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();
  return useQuery<IdpGroupDTO[]>({
    queryKey: identityQueryKeys.groups(),
    queryFn: () => internalApiClient.get<IdpGroupDTO[]>("/settings/identity/groups"),
    enabled,
  });
};

export const useInvalidateIdentity = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: identityQueryKeys.connection() }),
      queryClient.invalidateQueries({ queryKey: identityQueryKeys.tokens() }),
      queryClient.invalidateQueries({ queryKey: identityQueryKeys.groups() }),
    ]);
};
