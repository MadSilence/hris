import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { agreementTabOf } from "@/api/modules/hub/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** CM08: who agreed to one must-read page. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisApiHubService.whoAgreed(id, agreementTabOf(new URL(req.url).searchParams.get("tab"))));
});
