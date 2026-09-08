import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffRequestsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useInvalidateEmployeeTimeOffBalancesQuery } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import {
  editTimeOffRequestAction,
  type EditTimeOffRequestActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/actions/editTimeOffRequestAction";

/**
 * An edit reverses the old charge and takes the new one, so the balance moves even when the number
 * of days is unchanged — the ledger gains two entries either way.
 */
export const useEditTimeOffRequest = () => {
  const invalidateRequests = useInvalidateTimeOffRequestsQuery();
  const invalidateBalances = useInvalidateEmployeeTimeOffBalancesQuery();

  return useMutation({
    mutationFn: async (payload: EditTimeOffRequestActionInput) => {
      const result = await editTimeOffRequestAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to edit the request");
      }

      return result;
    },
    onSuccess: () => {
      invalidateRequests();
      invalidateBalances();
    },
  });
};
