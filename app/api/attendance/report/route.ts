import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";
import type { AttendanceReportRequest } from "@/models/attendance";

/** POST for a read: the filter rows travel in the body. */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json()) as AttendanceReportRequest;
  return NextResponse.json(await hrisApiAttendanceService.report(body));
});
