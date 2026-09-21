import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";

type RouteContext = { params: Promise<{ userId: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  const month = new URL(req.url).searchParams.get("month");
  return NextResponse.json(await hrisApiAttendanceService.month(userId, month));
});
