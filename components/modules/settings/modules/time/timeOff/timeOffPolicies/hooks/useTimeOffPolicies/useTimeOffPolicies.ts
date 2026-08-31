import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTimeOffPoliciesQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";

export const useTimeOffPolicies = () => {
  return useQuery({
    queryKey: getTimeOffPoliciesQueryKey(),
    queryFn: () => timeOffPoliciesService.list(),
    // The profile's Time Off tab mounts three observers of this key (the calendar container, the
    // calendar and the request list). With the default `staleTime` of 0, each one that mounts after
    // the data is cached considers it stale and refetches — three requests for one render. The
    // policy catalogue changes about as often as the field catalogue, which uses the same window.
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvalidateTimeOffPoliciesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [TIME_OFF_QUERY_KEY, "policies"],
    });
  };
};
