import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";

/** POST for a read: the row ids travel in the body, not in a URL. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as { from: string; to: string; userIds: string[] };

  const marks = await hrisCompanyCalendarService.marks({
    from: body.from,
    to: body.to,
    userIds: body.userIds ?? [],
  });

  return NextResponse.json(marks);
});
