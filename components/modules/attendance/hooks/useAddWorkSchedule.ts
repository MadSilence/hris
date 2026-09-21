"use client";

import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { WorkSchedule } from "@/models/attendance";
import {
  addWorkScheduleAction,
  type AddWorkScheduleInput,
} from "@/components/modules/attendance/actions";
import { AttendanceActionError } from "./useRecordAttendanceDay";
import { useInvalidateAttendance } from "./useAttendanceQueries";

export const useAddWorkSchedule = () => {
  const invalidate = useInvalidateAttendance();

  return useMutation<WorkSchedule, Error, AddWorkScheduleInput>({
    mutationFn: async (input) => {
      const result = await addWorkScheduleAction(input);
      if (result.status !== ActionStatus.SUCCESS || !result.data) {
        throw new AttendanceActionError(result);
      }
      return result.data;
    },
    onSuccess: () => {
      void invalidate();
    },
  });
};
