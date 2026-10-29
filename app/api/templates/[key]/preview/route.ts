import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { templatesRoutes } from "@/api/modules/templates/routes";

type RouteContext = { params: Promise<{ key: string }> };

/** POST for a read: the person's choices in the preview travel in the body. */
export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { key } = await context.params;
  return templatesRoutes.preview(req, key);
});
