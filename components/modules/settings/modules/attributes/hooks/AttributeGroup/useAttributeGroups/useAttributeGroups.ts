import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

export const ATTRIBUTE_GROUPS_QUERY_KEY = "ATTRIBUTE_GROUPS_QUERY_KEY";

const getAttributeGroups = async (apiClient: InternalApiClient): Promise<AttributeGroup[]> =>
  apiClient.get<AttributeGroup[]>("/groups");

export const useAttributeGroups = () => {
  const {internalApiClient} = useAppDataContext();

  return useQuery<AttributeGroup[]>({
    queryKey: [ATTRIBUTE_GROUPS_QUERY_KEY],
    queryFn: () => getAttributeGroups(internalApiClient),
  });
};

export const useInvalidateAttributeGroupsQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({queryKey: [ATTRIBUTE_GROUPS_QUERY_KEY]});
  };
};
