"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisCalendarViewsService } from "@/api/modules/calendarViews/services";
import type { CalendarView, CalendarViewPayload } from "@/models/calendarView";
import { toActionError } from "@/lib/errors/withActionError";

export type CalendarViewActionResult<T> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
};

export async function createCalendarViewAction(
  name: string,
  payload: CalendarViewPayload,
): Promise<CalendarViewActionResult<CalendarView>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisCalendarViewsService.create({ name, payload }) };
  } catch (error) {
    return toActionError(error, "calendarViewActions");
  }
}

export async function updateCalendarViewAction(
  id: string,
  name: string,
  payload: CalendarViewPayload,
): Promise<CalendarViewActionResult<CalendarView>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisCalendarViewsService.update(id, { name, payload }) };
  } catch (error) {
    return toActionError(error, "calendarViewActions");
  }
}

export async function deleteCalendarViewAction(id: string): Promise<CalendarViewActionResult<void>> {
  try {
    await hrisCalendarViewsService.remove(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "calendarViewActions");
  }
}
