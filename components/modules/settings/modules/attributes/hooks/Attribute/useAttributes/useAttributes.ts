import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { Attribute } from "@/models/attribute/Attribute";
import { ATTRIBUTE_GROUPS_QUERY_KEY } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";

export const ATTRIBUTES_QUERY_KEY = "ATTRIBUTES_QUERY_KEY";

const getAttributes = async (apiClient: InternalApiClient): Promise<Attribute[]> =>
  apiClient.get<Attribute[]>("/attributes");

export const useAttributes = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<Attribute[]>({
    queryKey: [ATTRIBUTES_QUERY_KEY],
    queryFn: () => getAttributes(internalApiClient),
  });
};

export const useInvalidateAttributesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [ATTRIBUTE_GROUPS_QUERY_KEY] });
  };
};
