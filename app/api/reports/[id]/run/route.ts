import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** POST for a read: a saved report, with an optional time override or a table's next page. */
export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return reportsRoutes.runSaved(req, id);
});
