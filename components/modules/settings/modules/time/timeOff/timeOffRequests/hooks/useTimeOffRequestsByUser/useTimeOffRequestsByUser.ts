import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getTimeOffRequestsByUserQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

type UseTimeOffRequestsByUserArgs = {
  userId: string;
};

export const useTimeOffRequestsByUser = ({
  userId,
}: UseTimeOffRequestsByUserArgs) => {
  return useQuery({
    queryKey: getTimeOffRequestsByUserQueryKey(userId),
    queryFn: () => {
      assertTimeOffId(userId, "userId");
      return timeOffRequestsService.listByUserId(userId);
    },
    enabled: Boolean(userId && userId !== "undefined"),
  });
};

export const useInvalidateTimeOffRequestsQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [TIME_OFF_QUERY_KEY, "requests"],
    });
  };
};
