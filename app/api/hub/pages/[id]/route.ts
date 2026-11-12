import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiHubService } from "@/api/modules/hub/services";

type RouteContext = { params: Promise<{ id: string }> };

/** CP02: the reader's view, with their request, agreement and the changed blocks. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisApiHubService.page(id));
});
