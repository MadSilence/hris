import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";

type RouteContext = { params: Promise<{ id: string }> };

/** The colleagues a nomination can name (REVIEWS_PLAN.md 11.0): the picker of the Nominate Peers page. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  const q = new URL(req.url).searchParams.get("q");
  return NextResponse.json(await hrisApiReviewsService.colleagues(id, q && q.trim() ? q.trim() : null));
});
