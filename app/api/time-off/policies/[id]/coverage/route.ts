import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyCoverageRoutes } from "@/api/modules/timeOff/timeOffPolicyCoverage/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyCoverageRoutes.getByPolicyId(req, id);
});
