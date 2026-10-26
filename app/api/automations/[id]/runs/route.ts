import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";
import type { AutomationRunStatus } from "@/models/automations";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiAutomationsService.runs(id, {
    status: (params.get("status") as AutomationRunStatus | null) ?? null,
    personId: params.get("personId"),
    page: Number(params.get("page") ?? 0),
    size: Number(params.get("size") ?? 50),
  }));
});
