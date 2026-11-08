import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

type RouteContext = { params: Promise<{ runId: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { runId } = await context.params;
  return NextResponse.json(await hrisApiAutomationsService.run(runId));
});
