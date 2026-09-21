import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { streamBinary } from "@/api/utils/exportResponse";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";

/** A month of timesheets as a file. Streams Java's response as is; the file name is Java's. */
export const GET = apiRequestWrapper(async (req: Request) => {
  const backendResponse = await hrisApiAttendanceService.exportMonth(new URL(req.url).searchParams);
  return streamBinary(backendResponse);
});
