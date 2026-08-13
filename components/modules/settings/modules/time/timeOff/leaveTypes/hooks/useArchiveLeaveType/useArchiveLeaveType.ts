import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateLeaveTypesQuery } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveTypes";
import {
  archiveLeaveTypeAction,
  type ArchiveLeaveTypeActionInput,
} from "@/components/modules/settings/modules/time/timeOff/leaveTypes/actions/archiveLeaveTypeAction";

export const useArchiveLeaveType = () => {
  const invalidateLeaveTypes = useInvalidateLeaveTypesQuery();

  return useMutation({
    mutationFn: async (payload: ArchiveLeaveTypeActionInput) => {
      const result = await archiveLeaveTypeAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to archive leave type");
      }

      return result;
    },
    onSuccess: () => {
      invalidateLeaveTypes();
    },
  });
};
