"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  AttendanceEntry,
  AttendanceEntryUpdateRequest,
  AttendanceEntryWriteRequest,
  WorkSchedule,
  WorkScheduleWriteRequest,
} from "@/models/attendance";

export type LogAttendanceInput = { userId: string; body: AttendanceEntryWriteRequest };
export type AmendAttendanceInput = { userId: string; entryId: string; body: AttendanceEntryUpdateRequest };
export type RemoveAttendanceInput = { userId: string; entryId: string };
export type AddWorkScheduleInput = { userId: string; body: WorkScheduleWriteRequest };

/** Logs the same span on every picked day — written or refused as a whole. */
export async function logAttendanceAction(input: LogAttendanceInput): Promise<ActionResult<AttendanceEntry[]>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiAttendanceService.logEntries(input.userId, input.body) };
  } catch (error) {
    return toActionError(error, "logAttendanceAction");
  }
}

export async function amendAttendanceAction(input: AmendAttendanceInput): Promise<ActionResult<AttendanceEntry>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisApiAttendanceService.amendEntry(input.userId, input.entryId, input.body),
    };
  } catch (error) {
    return toActionError(error, "amendAttendanceAction");
  }
}

export async function removeAttendanceAction(input: RemoveAttendanceInput): Promise<ActionResult<null>> {
  try {
    await hrisApiAttendanceService.removeEntry(input.userId, input.entryId);
    return { status: ActionStatus.SUCCESS, data: null };
  } catch (error) {
    return toActionError(error, "removeAttendanceAction");
  }
}

/** Adds a schedule from a date. There is no update and no delete: a correction is a new row. */
export async function addWorkScheduleAction(input: AddWorkScheduleInput): Promise<ActionResult<WorkSchedule>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisApiAttendanceService.addWorkSchedule(input.userId, input.body),
    };
  } catch (error) {
    return toActionError(error, "addWorkScheduleAction");
  }
}
