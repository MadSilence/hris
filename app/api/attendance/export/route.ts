import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";
import type { AttendanceExportRequest } from "@/models/attendance";

/**
 * What the overview shows, as a file — a POST, because the request carries the filters. The format
 * rides the query, as on the People export; the file name is Java's.
 */
export const POST = apiRequestWrapper(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as AttendanceExportRequest;
  return streamBinary(await hrisApiAttendanceService.exportReport(body, formatOf(req)));
});
