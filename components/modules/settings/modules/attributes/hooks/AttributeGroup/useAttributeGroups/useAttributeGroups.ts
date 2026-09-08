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
    /**
     * Reference data several components read at once, with an explicit invalidator beside it.
     *
     * Without a `staleTime` the default is 0, so each component that mounts and reads this hook
     * finds the cache stale and refetches — the profile's Time Off tab fetched its policies three
     * times per render for exactly this reason. The role detail page has the same shape: the
     * container and both of its panels read this list. Every mutation invalidates the key, so
     * holding it fresh for five minutes cannot serve a stale answer after a change.
     */
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvalidateAttributeGroupsQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({queryKey: [ATTRIBUTE_GROUPS_QUERY_KEY]});
  };
};
