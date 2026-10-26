import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { jobFamilyRoutes } from "@/api/modules/jobfamily/routes/jobFamilyRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return jobFamilyRoutes.getRestoreImpact(id);
});
