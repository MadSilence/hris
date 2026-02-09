import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { Office } from "@/models/office";

export const OFFICES_QUERY_KEY = "OFFICES_QUERY_KEY";

const getOffices = async (
  apiClient: InternalApiClient
): Promise<Office[]> =>
  apiClient.get<Office[]>("/office");

export const useOffice = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<Office[]>({
    queryKey: [OFFICES_QUERY_KEY],
    queryFn: () => getOffices(internalApiClient),
  });
};

export const useInvalidateOfficeQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [OFFICES_QUERY_KEY],
    });
  };
};
