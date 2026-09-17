import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";

type RouteContext = { params: Promise<{ id: string }> };

/** What deleting the calendar takes with it — read before the dialog offers Delete. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisPublicHolidayCalendarsService.getDeleteImpact(id));
});
