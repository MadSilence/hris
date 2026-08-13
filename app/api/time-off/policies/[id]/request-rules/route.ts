import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyRequestRulesRoutes } from "@/api/modules/timeOff/timeOffPolicyRequestRules/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyRequestRulesRoutes.getByPolicyId(req, id);
});
