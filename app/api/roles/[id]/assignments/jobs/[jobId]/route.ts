import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisRoleAssignmentsService } from "@/api/modules/roles/services/hrisRoleAssignmentsService/hrisRoleAssignmentsService";

type RouteContext = { params: Promise<{ id: string; jobId: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id, jobId } = await context.params;
  const data = await hrisRoleAssignmentsService.jobStatus(id, jobId);
  return NextResponse.json(data);
});
