import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyTenureRulesRoutes } from "@/api/modules/timeOff/timeOffPolicyTenureRules/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyTenureRulesRoutes.getByPolicyId(req, id);
});
