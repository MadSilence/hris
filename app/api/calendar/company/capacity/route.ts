import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";
import type { CompanyCalendarGrouping } from "@/models/calendar";

/** POST for a read, like marks: the group ids travel in the body. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as {
    from: string;
    to: string;
    groupBy: CompanyCalendarGrouping | null;
    groupIds: string[];
  };

  const capacity = await hrisCompanyCalendarService.capacity({
    from: body.from,
    to: body.to,
    groupBy: body.groupBy ?? null,
    groupIds: body.groupIds ?? [],
  });

  return NextResponse.json(capacity);
});
