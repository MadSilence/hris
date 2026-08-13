import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateLeaveTypesQuery } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveTypes";
import {
  updateLeaveTypeAction,
  type UpdateLeaveTypeActionInput,
} from "@/components/modules/settings/modules/time/timeOff/leaveTypes/actions/updateLeaveTypeAction";

export const useUpdateLeaveType = () => {
  const invalidateLeaveTypes = useInvalidateLeaveTypesQuery();

  return useMutation({
    mutationFn: async (payload: UpdateLeaveTypeActionInput) => {
      const result = await updateLeaveTypeAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update leave type");
      }

      return result;
    },
    onSuccess: () => {
      invalidateLeaveTypes();
    },
  });
};
