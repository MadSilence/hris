import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalApiClient } from "@/components/clients/apiClient";
import { JobLevelItem } from "@/models/job";

export const JOB_LEVEL_ITEM_QUERY_KEY = "JOB_LEVEL_ITEM_QUERY_KEY";

const getJobLevelItems = async (
  apiClient: InternalApiClient
): Promise<JobLevelItem[]> =>
  apiClient.get<JobLevelItem[]>("/job-level-items");

export const useJobLevelItem = () => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<JobLevelItem[]>({
    queryKey: [JOB_LEVEL_ITEM_QUERY_KEY],
    queryFn: () => getJobLevelItems(internalApiClient),
  });
};

export const useInvalidateJobLevelItemQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [JOB_LEVEL_ITEM_QUERY_KEY] });
  };
};
