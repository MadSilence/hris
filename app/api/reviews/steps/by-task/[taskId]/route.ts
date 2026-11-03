import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";

type RouteContext = { params: Promise<{ taskId: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { taskId } = await context.params;
  return NextResponse.json(await hrisApiReviewsService.stepByTask(taskId));
});
