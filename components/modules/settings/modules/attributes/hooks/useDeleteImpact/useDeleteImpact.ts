import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery } from "@tanstack/react-query";
import {
  AttributeDeleteImpact,
  GroupDeleteImpact,
} from "@/models/attribute/DeleteImpact";

export const useAttributeDeleteImpact = (attributeId: string | null) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<AttributeDeleteImpact>({
    queryKey: ["ATTRIBUTE_DELETE_IMPACT", attributeId],
    queryFn: () =>
      internalApiClient.get<AttributeDeleteImpact>(`/attributes/${attributeId}/impact`),
    enabled: !!attributeId,
    staleTime: 0,
  });
};

export const useGroupDeleteImpact = (groupId: string | null) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<GroupDeleteImpact>({
    queryKey: ["GROUP_DELETE_IMPACT", groupId],
    queryFn: () =>
      internalApiClient.get<GroupDeleteImpact>(`/groups/${groupId}/impact`),
    enabled: !!groupId,
    staleTime: 0,
  });
};
