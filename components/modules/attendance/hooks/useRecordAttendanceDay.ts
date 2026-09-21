"use client";

import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { AttendanceEntry } from "@/models/attendance";
import {
  recordAttendanceDayAction,
  type RecordAttendanceDayInput,
} from "@/components/modules/attendance/actions";
import { useInvalidateAttendance } from "./useAttendanceQueries";

/**
 * Thrown with the action's envelope intact, so the row that failed can show the dictionary's words
 * beside its own inputs — and a field-bound refusal (hours, description) can name its field.
 */
export class AttendanceActionError extends Error {
  constructor(public readonly result: ActionResult) {
    super(result.errorMessage ?? "The day could not be saved.");
    this.name = "AttendanceActionError";
  }
}

export const useRecordAttendanceDay = () => {
  const invalidate = useInvalidateAttendance();

  return useMutation<AttendanceEntry, Error, RecordAttendanceDayInput>({
    mutationFn: async (input) => {
      const result = await recordAttendanceDayAction(input);
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
