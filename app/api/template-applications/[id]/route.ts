import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { templatesRoutes } from "@/api/modules/templates/routes";

type RouteContext = { params: Promise<{ id: string }> };

/** One application of a template — the result screen after applying. */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return templatesRoutes.application(id);
});
