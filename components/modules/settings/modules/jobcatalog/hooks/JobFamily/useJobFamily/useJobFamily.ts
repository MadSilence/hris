import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { JobFamily } from "@/models/job/JobFamily";

export const JOB_FAMILY_QUERY_KEY = "JOB_FAMILY_QUERY_KEY";

const getJobFamily = async (
  apiClient: InternalApiClient
): Promise<JobFamily[]> => apiClient.get<JobFamily[]>("/job-families");

export const useJobFamily = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<JobFamily[]>({
    queryKey: [JOB_FAMILY_QUERY_KEY],
    queryFn: () => getJobFamily(internalApiClient),
  });
};

export const useInvalidateJobFamilyQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [JOB_FAMILY_QUERY_KEY] });
  };
};
