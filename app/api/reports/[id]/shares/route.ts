import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** Who the report is shared with. Sharing itself is a server action. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return reportsRoutes.shares(id);
});
