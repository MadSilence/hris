import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisApiLifecycleService.deleteImpact(id));
});
