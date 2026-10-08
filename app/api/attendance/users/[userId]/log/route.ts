import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";

type RouteContext = { params: Promise<{ userId: string }> };

/** One person's period, day by day. `from` and `to` are required; `expectedUntil` is optional. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiAttendanceService.log(userId, {
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    expectedUntil: params.get("expectedUntil"),
  }));
});
