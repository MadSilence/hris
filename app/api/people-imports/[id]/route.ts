import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { peopleImportRoutes } from "@/api/modules/peopleImport/routes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return peopleImportRoutes.get(id);
});
