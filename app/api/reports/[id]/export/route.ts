import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** A saved report as a file, streamed through as Java wrote it; `?format=csv|xlsx`. */
export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return reportsRoutes.exportSaved(req, id);
});
