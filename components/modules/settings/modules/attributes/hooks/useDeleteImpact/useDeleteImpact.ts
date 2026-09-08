import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery } from "@tanstack/react-query";
import {
  AttributeDeleteImpact,
  GroupDeleteImpact,
} from "@/models/attribute/DeleteImpact";

/**
 * How long a dialog is allowed to say "checking\u2026" before it admits it does not know.
 *
 * The default is three retries with exponential backoff, so a dead endpoint kept the confirmation
 * dialog on "checking what depends on this" for about seven seconds \u2014 with Delete enabled the whole
 * time. These numbers are a snapshot taken at the moment somebody decides; one retry is generosity
 * enough, and being told "unknown" quickly is worth more than being told nothing slowly.
 */
const IMPACT_RETRY = 1;

export const useAttributeDeleteImpact = (attributeId: string | null) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<AttributeDeleteImpact>({
    queryKey: ["ATTRIBUTE_DELETE_IMPACT", attributeId],
    queryFn: () =>
      internalApiClient.get<AttributeDeleteImpact>(`/attributes/${attributeId}/impact`),
    enabled: !!attributeId,
    staleTime: 0,
    retry: IMPACT_RETRY,
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
    retry: IMPACT_RETRY,
  });
};
