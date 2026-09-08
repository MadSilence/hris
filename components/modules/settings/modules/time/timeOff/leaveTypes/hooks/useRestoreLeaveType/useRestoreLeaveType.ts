import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateLeaveTypesQuery } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveTypes";
import {
  restoreLeaveTypeAction,
  type RestoreLeaveTypeActionInput,
} from "@/components/modules/settings/modules/time/timeOff/leaveTypes/actions/restoreLeaveTypeAction";

export const useRestoreLeaveType = () => {
  const invalidateLeaveTypes = useInvalidateLeaveTypesQuery();

  return useMutation({
    mutationFn: async (payload: RestoreLeaveTypeActionInput) => {
      const result = await restoreLeaveTypeAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to restore the leave type");
      }

      return result;
    },
    onSuccess: () => {
      invalidateLeaveTypes();
    },
  });
};
