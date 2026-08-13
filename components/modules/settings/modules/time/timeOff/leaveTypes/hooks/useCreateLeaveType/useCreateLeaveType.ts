import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateLeaveTypesQuery } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveTypes";
import {
  createLeaveTypeAction,
  type CreateLeaveTypeActionInput,
} from "@/components/modules/settings/modules/time/timeOff/leaveTypes/actions/createLeaveTypeAction";

export const useCreateLeaveType = () => {
  const invalidateLeaveTypes = useInvalidateLeaveTypesQuery();

  return useMutation({
    mutationFn: async (payload: CreateLeaveTypeActionInput) => {
      const result = await createLeaveTypeAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to create leave type");
      }

      return result;
    },
    onSuccess: () => {
      invalidateLeaveTypes();
    },
  });
};
