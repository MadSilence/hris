import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiBulkEditService } from "@/api/modules/bulkEdit/services/hrisApiBulkEditService";

export const GET = apiRequestWrapper(async (
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) => {
  const { jobId } = await params;
  const status = await hrisApiBulkEditService.jobStatus(jobId);
  return NextResponse.json(status);
});
