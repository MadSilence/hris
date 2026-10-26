import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserScheduledChangesService } from "@/api/modules/users/modules/scheduledChanges/services";

type RouteContext = { params: Promise<{ id: string }> };

/** A person's scheduled changes. Java decides which of them the reader may see; this only translates. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return NextResponse.json(await hrisUserScheduledChangesService.listByUserId(id));
});
