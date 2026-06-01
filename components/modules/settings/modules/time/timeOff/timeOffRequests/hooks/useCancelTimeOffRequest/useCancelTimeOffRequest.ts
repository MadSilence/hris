import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  cancelTimeOffRequestAction,
  type CancelTimeOffRequestActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/cancelTimeOffRequestAction";

export const useCancelTimeOffRequest = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();
  // TODO: invalidate affected balance after cancellation (balance is restored on cancel)
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: CancelTimeOffRequestActionInput) => {
      const result = await cancelTimeOffRequestAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to cancel time off request"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidateRequests();
      invalidateBalances();
    },
  });
};
