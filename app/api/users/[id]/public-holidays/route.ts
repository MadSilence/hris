import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserPublicHolidaysService } from "@/api/modules/publicHolidays/userHolidays/services";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const yearParam = new URL(req.url).searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;

  const holidays = await hrisUserPublicHolidaysService.listByUserId(id, year);

  return NextResponse.json(holidays);
});
