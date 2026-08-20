import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { InternalApiClient } from "@/components/clients/apiClient";
import { JobLevelGroup } from "@/models/job";

export const JOB_LEVEL_GROUP_QUERY_KEY = "JOB_LEVEL_GROUP_QUERY_KEY";

const getJobLevelGroups = async (
  apiClient: InternalApiClient
): Promise<JobLevelGroup[]> => apiClient.get<JobLevelGroup[]>("/job-level-groups");

/**
 * Career tracks with their grades and both counters. Read by the Job Levels screen and by the
 * grade picker in the job modal, so it is cached for a few minutes rather than refetched per modal.
 */
export const useJobLevelGroups = (enabled = true) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<JobLevelGroup[]>({
    queryKey: [JOB_LEVEL_GROUP_QUERY_KEY],
    queryFn: () => getJobLevelGroups(internalApiClient),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useInvalidateJobLevelGroupsQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [JOB_LEVEL_GROUP_QUERY_KEY] });
  };
};
