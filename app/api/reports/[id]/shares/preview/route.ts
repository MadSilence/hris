import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** POST for a read: what sharing with these grantees would hide from whom. */
export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return reportsRoutes.sharePreview(req, id);
});
