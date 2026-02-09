import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { LegalEntity } from "@/models/legalEntity";

export const LEGAL_ENTITIES_QUERY_KEY = "LEGAL_ENTITIES_QUERY_KEY";

const getLegalEntities = async (
  apiClient: InternalApiClient
): Promise<LegalEntity[]> =>
  apiClient.get<LegalEntity[]>("/legal-entity");

export const useLegalEntity = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<LegalEntity[]>({
    queryKey: [LEGAL_ENTITIES_QUERY_KEY],
    queryFn: () => getLegalEntities(internalApiClient),
  });
};

export const useInvalidateLegalEntityQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [LEGAL_ENTITIES_QUERY_KEY],
    });
  };
};
