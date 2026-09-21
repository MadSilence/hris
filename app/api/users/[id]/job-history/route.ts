import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserJobHistoryService } from "@/api/modules/users/modules/jobHistory/services";

type RouteContext = { params: Promise<{ id: string }> };

/** A person's position timeline. Java decides who may read it; this only translates. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisUserJobHistoryService.listByUserId(id));
});
