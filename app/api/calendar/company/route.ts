import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisCompanyCalendarService } from "@/api/modules/calendar/services";

export const GET = apiRequestWrapper(async (req: Request) => {
  const sp = new URL(req.url).searchParams;

  const page = await hrisCompanyCalendarService.company({
    from: sp.get("from") ?? "",
    to: sp.get("to") ?? "",
    cursor: sp.get("cursor") ?? undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    q: sp.get("q") ?? undefined,
  });

  return NextResponse.json(page);
});
