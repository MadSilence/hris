"use client";

import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import type { AttendanceEntry } from "@/models/attendance";
import {
  amendAttendanceAction,
  logAttendanceAction,
  removeAttendanceAction,
  type AmendAttendanceInput,
  type LogAttendanceInput,
  type RemoveAttendanceInput,
} from "@/components/modules/attendance/actions";
import { useInvalidateAttendance } from "./useAttendanceQueries";

/**
 * Thrown with the action's envelope intact, so the form can show the dictionary's words beside its
 * own inputs — and a field-bound refusal (a time, the description) can name its field.
 */
export class AttendanceActionError extends Error {
  constructor(public readonly result: ActionResult) {
    super(result.errorMessage ?? "The time could not be saved.");
    this.name = "AttendanceActionError";
  }
}

const unwrap = async <T,>(result: ActionResult<T>): Promise<T> => {
  if (result.status !== ActionStatus.SUCCESS) throw new AttendanceActionError(result);
  return result.data as T;
};

/** Logs the same span on every picked day. */
export const useLogAttendance = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation<AttendanceEntry[], Error, LogAttendanceInput>({
    mutationFn: async (input) => unwrap(await logAttendanceAction(input)),
    onSuccess: () => {
      void invalidate();
    },
  });
};

export const useAmendAttendance = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation<AttendanceEntry, Error, AmendAttendanceInput>({
    mutationFn: async (input) => unwrap(await amendAttendanceAction(input)),
    onSuccess: () => {
      void invalidate();
    },
  });
};

export const useRemoveAttendance = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation<null, Error, RemoveAttendanceInput>({
    mutationFn: async (input) => unwrap(await removeAttendanceAction(input)),
    onSuccess: () => {
      void invalidate();
    },
  });
};
