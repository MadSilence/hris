import { useQuery } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getTimeOffRequestQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffRequestsService } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/services/timeOffRequestsService";

type UseTimeOffRequestArgs = {
  requestId: string;
};

export const useTimeOffRequest = ({ requestId }: UseTimeOffRequestArgs) => {
  return useQuery({
    queryKey: getTimeOffRequestQueryKey(requestId),
    queryFn: () => {
      assertTimeOffId(requestId, "requestId");
      return timeOffRequestsService.getById(requestId);
    },
    enabled: Boolean(requestId && requestId !== "undefined"),
  });
};
