import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";

/** POST for a read, like marks: the row ids travel in the body. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as { from: string; to: string; userIds: string[] };

  const absences = await hrisCompanyCalendarService.absences({
    from: body.from,
    to: body.to,
    userIds: body.userIds ?? [],
  });

  return NextResponse.json(absences);
});
