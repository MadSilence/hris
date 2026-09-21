import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";
import type { CompanyCalendarGrouping } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

/** POST for a read: the group headers depend on the same filter rows as the board's rows. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as {
    q?: string | null;
    filters?: FilterDTO[] | null;
    groupBy: CompanyCalendarGrouping;
  };

  const groups = await hrisCompanyCalendarService.groups({
    q: body.q ?? undefined,
    filters: body.filters ?? null,
    groupBy: body.groupBy,
  });

  return NextResponse.json(groups);
});
