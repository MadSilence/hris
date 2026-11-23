import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";

type RouteContext = { params: Promise<{ userId: string }> };

/** A person's absence today and their next one, for the profile header. Java decides what the reader may see. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  return NextResponse.json(await hrisCompanyCalendarService.currentAndNext(userId));
});
