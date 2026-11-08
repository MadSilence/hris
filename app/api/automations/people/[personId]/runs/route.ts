import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

type RouteContext = { params: Promise<{ personId: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { personId } = await context.params;
  const params = new URL(req.url).searchParams;
  return NextResponse.json(await hrisApiAutomationsService.personRuns(personId,
    Number(params.get("page") ?? 0), Number(params.get("size") ?? 20)));
});
