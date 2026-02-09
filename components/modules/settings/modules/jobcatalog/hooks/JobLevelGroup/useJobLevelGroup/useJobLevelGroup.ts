import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { JobLevelGroup } from "@/models/job";

export const JOB_LEVEL_GROUP_QUERY_KEY = "JOB_LEVEL_GROUP_QUERY_KEY";

const getJobLevelGroups = async (
  apiClient: InternalApiClient
): Promise<JobLevelGroup[]> => apiClient.get<JobLevelGroup[]>("/job-level-groups");

export const useJobLevelGroup = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<JobLevelGroup[]>({
    queryKey: [JOB_LEVEL_GROUP_QUERY_KEY],
    queryFn: () => getJobLevelGroups(internalApiClient),
  });
};

export const useInvalidateJobLevelGroupQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [JOB_LEVEL_GROUP_QUERY_KEY] });
  };
};
