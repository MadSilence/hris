import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCalendarViewsService } from "@/api/modules/calendarViews/services";

export const GET = apiRequestWrapper(async () => {
  return NextResponse.json(await hrisCalendarViewsService.list());
});
