import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";
import type { FilterDTO } from "@/models/user/fields";

/** POST for a read: the filter rows travel in the body. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as {
    cursor?: string | null;
    limit?: number | null;
    q?: string | null;
    filters?: FilterDTO[] | null;
  };

  const page = await hrisCompanyCalendarService.people({
    cursor: body.cursor ?? undefined,
    limit: body.limit ?? undefined,
    q: body.q ?? undefined,
    filters: body.filters ?? null,
  });

  return NextResponse.json(page);
});
