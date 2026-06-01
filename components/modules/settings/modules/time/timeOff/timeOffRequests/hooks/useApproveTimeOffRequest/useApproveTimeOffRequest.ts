import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import {
  approveTimeOffRequestAction,
  type ApproveTimeOffRequestActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/approveTimeOffRequestAction";

export const useApproveTimeOffRequest = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();

  return useMutation({
    mutationFn: async (payload: ApproveTimeOffRequestActionInput) => {
      const result = await approveTimeOffRequestAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to approve time off request"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidateRequests();
    },
  });
};
