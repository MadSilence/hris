import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const params = new URL(req.url).searchParams;
  const yearParam = params.get("year");
  const requests = await hrisTimeOffRequestsService.listByUserId(id, {
    year: yearParam ? Number(yearParam) : null,
    status: params.get("status"),
  });

  return NextResponse.json(requests);
});
