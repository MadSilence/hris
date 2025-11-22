import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/models/user/User";
import { InternalApiClient } from "@/components/clients/apiClient";

export const PERSON_QUERY_KEY = "PERSON";

const getPerson = async (apiClient: InternalApiClient, id: string): Promise<User> =>
  apiClient.get<User>(`/users/${id}`)

export const usePerson = (id: string) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<User>({
    queryKey: [PERSON_QUERY_KEY],
    queryFn: () => getPerson(internalApiClient, id)
  });
};
