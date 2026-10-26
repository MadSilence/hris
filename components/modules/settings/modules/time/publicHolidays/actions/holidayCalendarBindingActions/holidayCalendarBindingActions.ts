"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file at
// request time, while tsc, eslint and jest all pass it (hris/CLAUDE.md, "Server Actions").

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisHolidayCalendarBindingsService } from "@/api/modules/publicHolidays/bindings/services";
import type {
  HolidayCalendarBinding,
  HolidayCalendarBindingPreview,
  HolidayCalendarBindingRequest,
} from "@/models/publicHolidays/binding";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * What binding a calendar would do — who inherits it, who has it by hand already, who keeps their own.
 * A POST that writes nothing; an action because it carries the draft, like the automation preview.
 */
export async function previewHolidayCalendarBindingAction(
  input: HolidayCalendarBindingRequest
): Promise<ActionResult<HolidayCalendarBindingPreview>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisHolidayCalendarBindingsService.preview(input) };
  } catch (error) {
    return toActionError(error, "previewHolidayCalendarBindingAction");
  }
}

/** Sets, changes or clears the Holiday Calendar field: a live rule on the automation engine. */
export async function setHolidayCalendarBindingAction(
  input: HolidayCalendarBindingRequest
): Promise<ActionResult<HolidayCalendarBinding>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisHolidayCalendarBindingsService.set(input) };
  } catch (error) {
    return toActionError(error, "setHolidayCalendarBindingAction");
  }
}
