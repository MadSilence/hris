import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";

type RouteContext = { params: Promise<{ id: string }> };

/** A cycle's results as a file (REVIEWS_PLAN.md 12.4): streamed through as Java wrote it. */
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return streamBinary(await hrisApiReviewsService.exportResults(id, formatOf(req)));
});
