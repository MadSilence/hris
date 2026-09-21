"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  AttendanceEntry,
  RecordAttendanceDayRequest,
  WorkSchedule,
  WorkScheduleWriteRequest,
} from "@/models/attendance";

export type RecordAttendanceDayInput = {
  userId: string;
  /** `yyyy-MM-dd`. */
  date: string;
  body: RecordAttendanceDayRequest;
};

export type AddWorkScheduleInput = {
  userId: string;
  body: WorkScheduleWriteRequest;
};

/** Records a day or amends the one already there. Zero hours clears it. */
export async function recordAttendanceDayAction(input: RecordAttendanceDayInput): Promise<ActionResult<AttendanceEntry>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisApiAttendanceService.recordDay(input.userId, input.date, input.body),
    };
  } catch (error) {
    return toActionError(error, "recordAttendanceDayAction");
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
