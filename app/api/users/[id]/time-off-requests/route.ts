import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const requests = await hrisTimeOffRequestsService.listByUserId(id);

  return NextResponse.json(requests);
});
