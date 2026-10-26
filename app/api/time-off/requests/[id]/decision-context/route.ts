import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffRequestsRoutes } from "@/api/modules/timeOff/timeOffRequests/routes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffRequestsRoutes.getDecisionContext(id);
});
