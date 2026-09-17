import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffRequestsRoutes } from "@/api/modules/timeOff/timeOffRequests/routes";

type RouteContext = { params: Promise<{ id: string }> };

// Through the routes controller, like every other read — the query parsing lived here as a copy of
// `timeOffRequestsRoutes.listByUserId`, which was then tested while this copy ran.
export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffRequestsRoutes.listByUserId(req, id);
});
