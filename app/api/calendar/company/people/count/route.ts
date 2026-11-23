import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";
import type { FilterDTO } from "@/models/user/fields";

/** POST for a read: the count beside a saved view (B5) depends on the view's filter rows. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as { q?: string | null; filters?: FilterDTO[] | null };
  return NextResponse.json(await hrisCompanyCalendarService.count({ q: body.q ?? null, filters: body.filters ?? null }));
});
