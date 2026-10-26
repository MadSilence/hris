import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiAutomationsService } from "@/api/modules/automations/services";

type RouteContext = { params: Promise<{ userId: string }> };

/** What the person has, by hand or by which rule. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  return NextResponse.json(await hrisApiAutomationsService.provenance(userId));
});
